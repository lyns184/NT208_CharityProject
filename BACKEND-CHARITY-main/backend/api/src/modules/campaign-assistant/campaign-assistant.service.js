const crypto = require('crypto')
const AssistantUsage = require('./AssistantUsage.model')
const AppError = require('../../utils/AppError')
const { TOOL_HANDLERS, inferLocationArgs } = require('./campaign-assistant.query')
const { planToolCall } = require('./campaign-assistant.gemini')

function getDayKey() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function getIdentity(req) {
  if (req.user?._id) return `user:${req.user._id}`

  const forwarded = req.headers['x-forwarded-for']
  const ip = String(Array.isArray(forwarded) ? forwarded[0] : forwarded || req.ip || '')
    .split(',')[0]
    .trim()
  const hash = crypto
    .createHash('sha256')
    .update(`${ip}:${process.env.JWT_SECRET || 'openheart'}`)
    .digest('hex')

  return `guest:${hash}`
}

async function consumeQuota(req) {
  const isUser = Boolean(req.user?._id)
  const configuredLimit = Number(
    isUser
      ? process.env.CAMPAIGN_ASSISTANT_USER_DAILY_LIMIT
      : process.env.CAMPAIGN_ASSISTANT_GUEST_DAILY_LIMIT
  )
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0
    ? configuredLimit
    : isUser
      ? 30
      : 10
  const identity = getIdentity(req)
  const day = getDayKey()

  let usage = await AssistantUsage.findOne({ identity, day })
  if (usage?.count >= limit) {
    throw new AppError(
      `Bạn đã dùng hết ${limit} lượt hỏi hôm nay`,
      429,
      'ASSISTANT_DAILY_LIMIT'
    )
  }

  if (!usage) {
    try {
      usage = await AssistantUsage.create({ identity, day, count: 1 })
    } catch (error) {
      if (error.code !== 11000) throw error
      usage = await AssistantUsage.findOneAndUpdate(
        { identity, day, count: { $lt: limit } },
        { $inc: { count: 1 } },
        { returnDocument: 'after' }
      )
    }
  } else {
    usage = await AssistantUsage.findOneAndUpdate(
      { _id: usage._id, count: { $lt: limit } },
      { $inc: { count: 1 } },
      { returnDocument: 'after' }
    )
  }

  if (!usage) {
    throw new AppError(
      `Bạn đã dùng hết ${limit} lượt hỏi hôm nay`,
      429,
      'ASSISTANT_DAILY_LIMIT'
    )
  }

  return { limit, remaining: Math.max(limit - usage.count, 0) }
}

function formatVnd(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')} VNĐ`
}

function buildToolAnswer(toolName, result) {
  if (toolName === 'search_campaigns') {
    const count = result?.campaigns?.length || 0
    if (!count) return 'Mình chưa tìm thấy chiến dịch nào phù hợp với tiêu chí này.'
    return `Mình tìm thấy ${count} chiến dịch phù hợp. Bạn có thể xem thông tin và tiến độ trong các thẻ bên dưới.`
  }

  if (toolName === 'get_campaign_detail') {
    if (result?.ambiguous) {
      return `Mình tìm thấy ${result.campaigns?.length || 0} chiến dịch có tên gần giống. Bạn chọn chiến dịch trong các thẻ bên dưới nhé.`
    }

    const campaign = result?.campaign
    if (!campaign) return 'Mình chưa tìm thấy chiến dịch phù hợp.'
    return `${campaign.title} hiện đạt ${campaign.progress}% mục tiêu, đã nhận ${formatVnd(campaign.currentBalance)} và còn ${campaign.daysRemaining} ngày.`
  }

  if (toolName === 'get_campaign_statistics') {
    const count = Number(result?.campaignCount || 0)
    if (!count) return 'Hiện chưa có chiến dịch nào thuộc nhóm bạn đang hỏi.'
    return `Có ${count} chiến dịch thuộc nhóm này, tiến độ trung bình ${result.averageProgress}% và tổng số tiền đã nhận là ${formatVnd(result.totalRaisedAmount)}.`
  }

  return 'Mình đã tìm thấy dữ liệu phù hợp.'
}

function inferLocalToolCall(message) {
  const text = String(message || '').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
  const mentionsCampaign = /chien dich|quyen gop|ung ho|muc tieu|tien do|ket thuc/.test(text)
  if (!mentionsCampaign) return null

  const location = inferLocationArgs(message)
  const args = { ...location, limit: 5 }

  if (/chua co ai|khong co ai|chua.*(quyen gop|ung ho)|0.*(quyen gop|ung ho)/.test(text)) {
    return { name: 'search_campaigns', args: { ...args, hasDonations: false, sortBy: 'least_supported' } }
  }

  if (/sap.*(dat|du)|gan.*muc tieu|tien do.*(80|cao)/.test(text)) {
    return { name: 'search_campaigns', args: { ...args, minProgress: 80, maxProgress: 99.999, sortBy: 'progress' } }
  }

  if (/sap.*ket thuc|con.*7 ngay|ket thuc.*som/.test(text)) {
    return { name: 'search_campaigns', args: { ...args, endingWithinDays: 7, sortBy: 'ending_soon' } }
  }

  if (Object.keys(location).length && /chien dich|o dau|tai dau|co.*khong|co.*ko/.test(text)) {
    return { name: 'search_campaigns', args: { ...args, sortBy: 'newest' } }
  }

  return null
}
async function prepareResponse(message, history) {
  const localCall = inferLocalToolCall(message)
  const plan = localCall
    ? { functionCall: localCall, directText: '' }
    : await planToolCall(message, history)

  if (!plan.functionCall) {
    return {
      text: plan.directText || 'Bạn có thể hỏi mình về địa điểm, tiến độ, lượt ủng hộ hoặc thời gian kết thúc của chiến dịch.',
      campaigns: [],
    }
  }

  const handler = TOOL_HANDLERS[plan.functionCall.name]
  if (!handler) {
    throw new AppError('Gemini yêu cầu tool không hợp lệ', 502, 'INVALID_TOOL_CALL')
  }

  let toolResult
  try {
    toolResult = await handler(plan.functionCall.args || {})
  } catch (error) {
    if (['LOCATION_NOT_FOUND', 'AMBIGUOUS_LOCATION'].includes(error.errorCode)) {
      return {
        text: `${error.message}. Bạn có thể cho mình thêm tên tỉnh/thành phố hoặc chọn một địa điểm hiện hành nhé.`,
        campaigns: [],
      }
    }
    throw error
  }
  const campaigns = toolResult?.campaigns || (
    toolResult?.campaign ? [toolResult.campaign] : []
  )

  return {
    text: buildToolAnswer(plan.functionCall.name, toolResult),
    campaigns,
  }
}

module.exports = {
  consumeQuota,
  prepareResponse,
  buildToolAnswer,
  inferLocalToolCall,
}