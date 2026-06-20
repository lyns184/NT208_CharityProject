const assistantService = require('./campaign-assistant.service')

function sendEvent(res, event, data) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

function splitText(text, size = 36) {
  const chunks = []
  let remaining = String(text || '')

  while (remaining.length > size) {
    let index = remaining.lastIndexOf(' ', size)
    if (index < Math.floor(size / 2)) index = size
    chunks.push(remaining.slice(0, index))
    remaining = remaining.slice(index)
  }

  if (remaining) chunks.push(remaining)
  return chunks
}

class CampaignAssistantController {
  async stream(req, res, next) {
    const message = String(req.body?.message || '').trim()
    const history = req.body?.history

    if (!message || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Câu hỏi phải có từ 1 đến 2000 ký tự',
        error: 'VALIDATION_ERROR',
      })
    }

    try {
      const quota = await assistantService.consumeQuota(req)

      res.status(200)
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
      res.setHeader('Cache-Control', 'no-cache, no-transform')
      res.setHeader('Connection', 'keep-alive')
      res.flushHeaders()

      sendEvent(res, 'status', { message: 'Đang hiểu câu hỏi...' })
      const prepared = await assistantService.prepareResponse(message, history)

      sendEvent(res, 'meta', {
        remaining: quota.remaining,
        limit: quota.limit,
        campaigns: prepared.campaigns,
      })

      for (const text of splitText(prepared.text)) {
        sendEvent(res, 'delta', { text })
      }

      sendEvent(res, 'done', {
        disclaimer: 'Thông tin được tổng hợp từ dữ liệu chiến dịch trên OpenHeart.',
        updatedAt: new Date().toISOString(),
      })
      res.end()
    } catch (error) {
      if (!res.headersSent) return next(error)
      sendEvent(res, 'error', {
        message: error.message || 'Trợ lý đang bận, vui lòng thử lại sau',
        code: error.errorCode || 'ASSISTANT_ERROR',
      })
      res.end()
    }
  }
}

module.exports = new CampaignAssistantController()