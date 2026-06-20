const mongoose = require('mongoose')
const Campaign = require('../campaign/Campaign.model')
const Disbursement = require('../disbursement/Disbursement.model')
const administrativeUnits = require('../../data/vietnam-administrative-units.json')
const AppError = require('../../utils/AppError')

const PUBLIC_STATUSES = ['ACTIVE', 'GOAL_REACHED']
const DEFAULT_LIMIT = 5

const LEGACY_REGIONS = [
  {
    aliases: ['thu duc', 'tp thu duc', 'thanh pho thu duc'],
    provinceCode: 79,
    wardCodes: [26800, 26803, 26809, 26824, 26833, 26842, 26848, 26857, 26860, 27094, 27097, 27112],
  },
]

function normalizeText(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'D')
    .toLowerCase()
    .replace(/\b(tinh|thanh pho|tp|phuong|xa|thi tran)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function inferLocationArgs(message) {
  const normalizedMessage = normalizeText(message)
  const compactMessage = normalizedMessage.replace(/\s/g, '')
  const messageWords = normalizedMessage.split(' ').filter(Boolean)

  for (const region of LEGACY_REGIONS) {
    const alias = region.aliases.find((item) => normalizedMessage.includes(item))
    if (alias) return { wardName: alias }
  }

  const currentProvince = administrativeUnits.find((item) => {
    const normalizedProvince = normalizeText(item.name)
    return normalizedMessage.includes(normalizedProvince)
  })
  if (currentProvince) return { provinceName: currentProvince.name }

  const legacyProvinceAliases = [
    { aliases: ['binh thuan', 'dak nong'], name: 'Tỉnh Lâm Đồng' },
    { aliases: ['binh duong', 'ba ria vung tau'], name: 'Thành phố Hồ Chí Minh' },
    { aliases: ['ninh thuan'], name: 'Tỉnh Khánh Hòa' },
    { aliases: ['quang nam'], name: 'Thành phố Đà Nẵng' },
    { aliases: ['binh dinh'], name: 'Tỉnh Gia Lai' },
    { aliases: ['phu yen'], name: 'Tỉnh Đắk Lắk' },
    { aliases: ['kon tum'], name: 'Tỉnh Quảng Ngãi' },
  ]
  const legacyProvince = legacyProvinceAliases.find((item) =>
    item.aliases.some((alias) => normalizedMessage.includes(alias))
  )
  if (legacyProvince) return { provinceName: legacyProvince.name }

  const provinceAliases = [
    { aliases: ['tphcm', 'hcm', 'ho chi minh', 'sai gon', 'saigon'], name: 'Thành phố Hồ Chí Minh' },
    { aliases: ['hn', 'ha noi'], name: 'Thành phố Hà Nội' },
  ]
  const aliasedProvince = provinceAliases.find((item) =>
    item.aliases.some((alias) => {
      const normalizedAlias = normalizeText(alias)
      if (normalizedAlias.length <= 2) return messageWords.includes(normalizedAlias)
      return (
        normalizedMessage.includes(normalizedAlias) ||
        compactMessage.includes(normalizedAlias.replace(/\s/g, ''))
      )
    })
  )
  if (aliasedProvince) return { provinceName: aliasedProvince.name }

  const hasLocationCue = /(^| )(o|tai|khu vuc|phuong|xa)( |$)/.test(normalizedMessage)
  if (hasLocationCue) {
    const exactWardMatches = []
    const partialWardMatches = []

    for (const province of administrativeUnits) {
      for (const ward of province.wards) {
        const normalizedWard = normalizeText(ward.name)
        const entry = { province, ward, length: normalizedWard.length }
        if (normalizedMessage.includes(normalizedWard)) exactWardMatches.push(entry)
        else if (
          normalizedWard.length >= 5 &&
          normalizedMessage.split(' ').some((_, index, words) =>
            words.slice(index).join(' ').startsWith(normalizedWard)
          )
        ) {
          partialWardMatches.push(entry)
        }
      }
    }

    const wardMatches = exactWardMatches.length ? exactWardMatches : partialWardMatches
    wardMatches.sort((a, b) => b.length - a.length)
    if (wardMatches.length) {
      return {
        provinceName: wardMatches[0].province.name,
        wardName: wardMatches[0].ward.name,
      }
    }
  }

  return {}
}
function findLocation(provinceName, wardName) {
  let province = null
  let ward = null

  if (provinceName) {
    const query = normalizeText(provinceName)
    const compactQuery = query.replace(/\s/g, '')
    province = administrativeUnits.find((item) => {
      const candidate = normalizeText(item.name)
      const compactCandidate = candidate.replace(/\s/g, '')
      const acronym = candidate
        .split(' ')
        .filter(Boolean)
        .map((word) => word[0])
        .join('')
      const aliases = item.code === 79 ? ['hcm', 'tphcm', 'hochiminh', 'saigon'] : []

      return (
        candidate === query ||
        candidate.includes(query) ||
        query.includes(candidate) ||
        compactCandidate === compactQuery ||
        acronym === compactQuery ||
        aliases.includes(compactQuery)
      )
    })

    if (!province) {
      throw new AppError(
        `Không tìm thấy tỉnh/thành phố "${provinceName}" trong danh mục Việt Nam`,
        400,
        'LOCATION_NOT_FOUND'
      )
    }
  }

  if (wardName) {
    const query = normalizeText(wardName)
    const source = province ? [province] : administrativeUnits
    const exactMatches = []
    const partialMatches = []

    for (const item of source) {
      for (const candidate of item.wards) {
        const normalized = normalizeText(candidate.name)
        const entry = { province: item, ward: candidate }
        if (normalized === query) exactMatches.push(entry)
        else if (normalized.includes(query) || query.includes(normalized)) {
          partialMatches.push(entry)
        }
      }
    }

    const matches = exactMatches.length ? exactMatches : partialMatches

    if (matches.length > 1) {
      throw new AppError(
        `Có nhiều phường/xã tên "${wardName}", vui lòng cho biết thêm tỉnh/thành phố`,
        400,
        'AMBIGUOUS_LOCATION'
      )
    }

    if (!matches.length) {
      throw new AppError(
        `Không tìm thấy phường/xã "${wardName}"`,
        400,
        'LOCATION_NOT_FOUND'
      )
    }

    province = matches[0].province
    ward = matches[0].ward
  }

  return { province, ward }
}

function buildLocationMatch(provinceName, wardName) {
  const rawLocation = wardName || provinceName || ''
  const normalizedLocation = normalizeText(rawLocation)
  const legacyRegion = LEGACY_REGIONS.find((region) =>
    region.aliases.includes(normalizedLocation)
  )
  const explicitlyRequestsWard = /\bphường\b/i.test(String(rawLocation))

  if (legacyRegion && !explicitlyRequestsWard) {
    return {
      status: { $in: PUBLIC_STATUSES },
      'location.provinceCode': legacyRegion.provinceCode,
      'location.wardCode': { $in: legacyRegion.wardCodes },
    }
  }

  const { province, ward } = findLocation(provinceName, wardName)
  const match = { status: { $in: PUBLIC_STATUSES } }

  if (province) match['location.provinceCode'] = province.code
  if (ward) match['location.wardCode'] = ward.code

  return match
}
function campaignPipeline(match, options = {}) {
  const now = new Date()
  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'donations',
        let: { campaignId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$campaignId', '$$campaignId'] },
                  { $eq: ['$paymentStatus', 'SUCCESS'] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              donationCount: { $sum: 1 },
              donatedAmount: { $sum: '$amount' },
            },
          },
        ],
        as: 'donationStats',
      },
    },
    {
      $addFields: {
        donationCount: {
          $ifNull: [{ $arrayElemAt: ['$donationStats.donationCount', 0] }, 0],
        },
        donatedAmount: {
          $ifNull: [{ $arrayElemAt: ['$donationStats.donatedAmount', 0] }, 0],
        },
        progress: {
          $cond: [
            { $gt: ['$goalAmount', 0] },
            {
              $min: [
                { $multiply: [{ $divide: ['$currentBalance', '$goalAmount'] }, 100] },
                100,
              ],
            },
            0,
          ],
        },
        daysRemaining: {
          $max: [
            0,
            {
              $ceil: {
                $divide: [{ $subtract: ['$endDate', now] }, 1000 * 60 * 60 * 24],
              },
            },
          ],
        },
      },
    },
  ]

  const computedMatch = {}
  if (Number.isFinite(options.minProgress)) computedMatch.progress = { $gte: options.minProgress }
  if (Number.isFinite(options.maxProgress)) {
    computedMatch.progress = { ...(computedMatch.progress || {}), $lte: options.maxProgress }
  }
  if (options.hasDonations === true) computedMatch.donationCount = { $gt: 0 }
  if (options.hasDonations === false) computedMatch.donationCount = 0
  if (Number.isFinite(options.endingWithinDays)) {
    computedMatch.daysRemaining = { $lte: options.endingWithinDays }
  }
  if (Object.keys(computedMatch).length) pipeline.push({ $match: computedMatch })

  return pipeline
}

function serializeCampaign(campaign) {
  return {
    id: campaign._id.toString(),
    displayId: campaign.displayId,
    title: campaign.title,
    description: String(campaign.description || '').slice(0, 500),
    image: typeof campaign.image === 'string' ? campaign.image : campaign.image?.url,
    status: campaign.status,
    location: campaign.location,
    goalAmount: Number(campaign.goalAmount || 0),
    currentBalance: Number(campaign.currentBalance || 0),
    remainingAmount: Math.max(
      Number(campaign.goalAmount || 0) - Number(campaign.currentBalance || 0),
      0
    ),
    progress: Math.round(Number(campaign.progress || 0)),
    donationCount: Number(campaign.donationCount || 0),
    donatedAmount: Number(campaign.donatedAmount || 0),
    daysRemaining: Number(campaign.daysRemaining || 0),
    endDate: campaign.endDate,
    url: `/campaigns/${campaign._id}`,
  }
}

async function searchCampaigns(args = {}) {
  const match = buildLocationMatch(args.provinceName, args.wardName)
  const limit = Math.min(Math.max(Number(args.limit) || DEFAULT_LIMIT, 1), DEFAULT_LIMIT)
  const options = {
    minProgress: Number.isFinite(Number(args.minProgress)) ? Number(args.minProgress) : undefined,
    maxProgress: Number.isFinite(Number(args.maxProgress)) ? Number(args.maxProgress) : undefined,
    hasDonations: typeof args.hasDonations === 'boolean' ? args.hasDonations : undefined,
    endingWithinDays: Number.isFinite(Number(args.endingWithinDays))
      ? Math.max(Number(args.endingWithinDays), 0)
      : undefined,
  }
  const sortMap = {
    progress: { progress: -1, createdAt: -1 },
    raised: { currentBalance: -1, createdAt: -1 },
    ending_soon: { daysRemaining: 1, createdAt: -1 },
    least_supported: { donationCount: 1, currentBalance: 1, createdAt: -1 },
    newest: { createdAt: -1 },
  }

  const pipeline = campaignPipeline(match, options)
  pipeline.push(
    { $sort: sortMap[args.sortBy] || sortMap.newest },
    { $limit: limit },
    {
      $project: {
        donationStats: 0,
        embedding: 0,
        rejectionReason: 0,
      },
    }
  )

  const campaigns = await Campaign.aggregate(pipeline)
  return {
    campaigns: campaigns.map(serializeCampaign),
    count: campaigns.length,
  }
}

async function getCampaignDetail(args = {}) {
  const match = { status: { $in: PUBLIC_STATUSES } }

  if (args.campaignId) {
    if (mongoose.isValidObjectId(args.campaignId)) {
      match._id = new mongoose.Types.ObjectId(args.campaignId)
    } else {
      match.displayId = String(args.campaignId).trim().toUpperCase()
    }
  } else if (args.campaignName) {
    match.title = {
      $regex: String(args.campaignName).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    }
  } else {
    throw new AppError('Vui lòng cho biết tên chiến dịch', 400, 'VALIDATION_ERROR')
  }

  const pipeline = campaignPipeline(match)
  pipeline.push({ $limit: 3 })
  const campaigns = await Campaign.aggregate(pipeline)

  if (!campaigns.length) {
    throw new AppError('Không tìm thấy chiến dịch công khai phù hợp', 404, 'CAMPAIGN_NOT_FOUND')
  }

  if (campaigns.length > 1) {
    return {
      ambiguous: true,
      campaigns: campaigns.map(serializeCampaign),
    }
  }

  const campaign = campaigns[0]
  const disbursements = await Disbursement
    .find({ campaignId: campaign._id, status: 'COMPLETED' })
    .select('amount reason createdAt status')
    .sort({ createdAt: -1 })
    .lean()

  return {
    campaign: {
      ...serializeCampaign(campaign),
      disbursedAmount: disbursements.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      ),
      disbursements,
    },
  }
}

async function getCampaignStatistics(args = {}) {
  const match = buildLocationMatch(args.provinceName, args.wardName)
  const options = {}
  const category = args.category || 'all'

  if (category === 'near_goal') {
    options.minProgress = 80
    options.maxProgress = 99.999
  }
  if (category === 'no_donations') options.hasDonations = false
  if (category === 'ending_soon') {
    options.endingWithinDays = Number(args.endingWithinDays) || 7
  }

  const pipeline = campaignPipeline(match, options)
  pipeline.push({
    $group: {
      _id: null,
      campaignCount: { $sum: 1 },
      totalGoalAmount: { $sum: '$goalAmount' },
      totalRaisedAmount: { $sum: '$currentBalance' },
      totalDonationCount: { $sum: '$donationCount' },
      averageProgress: { $avg: '$progress' },
    },
  })

  const [stats] = await Campaign.aggregate(pipeline)
  return {
    category,
    campaignCount: stats?.campaignCount || 0,
    totalGoalAmount: stats?.totalGoalAmount || 0,
    totalRaisedAmount: stats?.totalRaisedAmount || 0,
    totalDonationCount: stats?.totalDonationCount || 0,
    averageProgress: Math.round(stats?.averageProgress || 0),
  }
}

const TOOL_HANDLERS = {
  search_campaigns: searchCampaigns,
  get_campaign_detail: getCampaignDetail,
  get_campaign_statistics: getCampaignStatistics,
}

module.exports = {
  TOOL_HANDLERS,
  searchCampaigns,
  getCampaignDetail,
  getCampaignStatistics,
  inferLocationArgs,
}
