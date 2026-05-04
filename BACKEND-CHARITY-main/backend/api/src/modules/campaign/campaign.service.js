/**
 * Campaign Module - Service Layer
 */

const Campaign = require('./Campaign.model')
const Donation = require('../payment/Donation.model')
const Disbursement = require('../disbursement/Disbursement.model')
const AppError = require('../../utils/AppError')
const { ERROR_MESSAGES } = require('../../constants/messages')

const PRIVATE_CAMPAIGN_STATUSES = new Set(['PENDING', 'REJECTED'])

class CampaignService {
  async attachDisbursements(campaigns) {
    const list = Array.isArray(campaigns) ? campaigns : [campaigns]
    const campaignIds = list.map((campaign) => campaign._id)
    const disbursements = await Disbursement.find({ campaignId: { $in: campaignIds } })
      .sort({ createdAt: -1 })

    const grouped = disbursements.reduce((acc, disbursement) => {
      const key = disbursement.campaignId.toString()
      if (!acc[key]) acc[key] = []
      const obj = disbursement.toObject()
      // sanitize proof arrays to avoid nulls causing frontend crashes
      if (Array.isArray(obj.proofImages)) obj.proofImages = obj.proofImages.filter(Boolean)
      else obj.proofImages = []
      if (Array.isArray(obj.proofETags)) obj.proofETags = obj.proofETags.filter(Boolean)
      else obj.proofETags = []
      acc[key].push(obj)
      return acc
    }, {})

    return list.map((campaign) => ({
      ...(typeof campaign.toObject === 'function' ? campaign.toObject() : campaign),
      disbursements: grouped[campaign._id.toString()] || [],
    }))
  }

  /**
   * Generate display ID (CAMP001, CAMP002...)
   */
  async generateDisplayId() {
    const count = await Campaign.countDocuments()
    return `CAMP${String(count + 1).padStart(3, '0')}`
  }

  /**
   * Create new campaign
   */
  async createCampaign(userId, userRole, data) {
    if (userRole === 'ADMIN') {
      throw new AppError('Admin không được phép tạo chiến dịch', 403, 'FORBIDDEN')
    }

    const { title, description, goalAmount, endDate, image } = data

    if (!title || !description || !goalAmount || !endDate || !image) {
      throw new AppError('Vui lòng điền đầy đủ thông tin', 400, 'VALIDATION_ERROR')
    }

    const displayId = await this.generateDisplayId()

    const campaign = await Campaign.create({
      title,
      description,
      goalAmount,
      endDate,
      image,
      displayId,
      creatorId: userId,
      currentBalance: 0,
      status: 'PENDING',
    })

    return campaign
  }

  /**
   * Get campaigns list
   */
  async getCampaigns(statusFilter = null, requester = null) {
    let filter = {}
    const isAdmin = requester?.role === 'ADMIN'

    if (statusFilter) {
      const requestedStatuses = statusFilter
        .split(',')
        .map((status) => status.trim().toUpperCase())
        .filter(Boolean)

      if (isAdmin) {
        filter.status = { $in: requestedStatuses }
      } else {
        const publicStatuses = requestedStatuses.filter(
          (status) => !PRIVATE_CAMPAIGN_STATUSES.has(status)
        )

        if (publicStatuses.length === 0) {
          return []
        }

        filter.status = { $in: publicStatuses }
      }
    } else {
      filter.status = { $in: ['ACTIVE', 'GOAL_REACHED'] }
    }

    const campaigns = await Campaign.find(filter)
      .populate('creatorId', 'name avatar isVerified accountType')
      .sort({ createdAt: -1 })

    const campaignIds = campaigns.map((campaign) => campaign._id)
    const donationStats = campaignIds.length
      ? await Donation.aggregate([
          {
            $match: {
              campaignId: { $in: campaignIds },
              paymentStatus: 'SUCCESS',
            },
          },
          {
            $group: {
              _id: '$campaignId',
              totalDonations: { $sum: 1 },
            },
          },
        ])
      : []

    const donationCountMap = donationStats.reduce((acc, item) => {
      acc[item._id.toString()] = item.totalDonations
      return acc
    }, {})

    const enrichedCampaigns = campaigns.map((campaign) => {
      const currentBalance = Number(campaign.currentBalance || 0)
      const goalAmount = Number(campaign.goalAmount || 0)
      const progress = goalAmount > 0 ? Math.min(Math.round((currentBalance / goalAmount) * 100), 100) : 0

      return {
        ...campaign.toObject(),
        totalDonations: donationCountMap[campaign._id.toString()] || 0,
        progress,
      }
    })

    return this.attachDisbursements(enrichedCampaigns)
  }

  /**
   * Get campaign by ID with stats
   */
  async assertCampaignVisibility(campaign, requester = null) {
    if (!PRIVATE_CAMPAIGN_STATUSES.has(campaign.status)) return

    const requesterId = requester?.id || requester?._id || requester?.userId
    const isOwner =
      requesterId &&
      campaign.creatorId &&
      campaign.creatorId.toString() === requesterId.toString()
    const isAdmin = requester?.role === 'ADMIN'

    if (!isOwner && !isAdmin) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }
  }

  async getCampaignById(campaignId, requester = null) {
    const campaign = await Campaign.findById(campaignId)
      .populate('creatorId', 'name avatar isVerified accountType')

    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    await this.assertCampaignVisibility(campaign, requester)

    const progress =
      campaign.goalAmount > 0
        ? Math.round((campaign.currentBalance / campaign.goalAmount) * 100)
        : 0

    const totalDonations = await Donation.countDocuments({
      campaignId: campaign._id,
      paymentStatus: 'SUCCESS',
    })

    const [campaignWithDisbursements] = await this.attachDisbursements([campaign])

    return { campaign: campaignWithDisbursements, progress, totalDonations }
  }

  /**
   * Get donations by campaign
   */
  async getDonationsByCampaign(campaignId, requester = null) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    await this.assertCampaignVisibility(campaign, requester)

    const donations = await Donation.find({
      campaignId: campaignId,
      paymentStatus: 'SUCCESS',
    })
      .populate('donorId', 'name avatar')
      .sort({ createdAt: -1 })

    const result = donations.map((d) => {
      const obj = d.toObject()
      if (obj.isAnonymous) {
        obj.donorId = {
          name: 'Người hảo tâm',
          avatar: null,
        }
      }
      return obj
    })

    return { donations: result, total: result.length }
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId, userId, data) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    if (campaign.creatorId.toString() !== userId.toString()) {
      throw new AppError('Bạn không có quyền thao tác chiến dịch này', 403, 'FORBIDDEN')
    }

    if (campaign.status === 'CLOSED') {
      throw new AppError('Chiến dịch đã đóng nên không thể chỉnh sửa thông tin', 400, 'VALIDATION_ERROR')
    }

    const { title, description, image } = data

    if (title) campaign.title = title
    if (description) campaign.description = description
    if (image) campaign.image = image
    campaign.status = 'PENDING'
    campaign.rejectionReason = ''

    await campaign.save()

    return campaign
  }

  /**
   * Close campaign
   */
  async closeCampaign(campaignId, userId) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    if (campaign.creatorId.toString() !== userId.toString()) {
      throw new AppError('Bạn không có quyền thao tác chiến dịch này', 403, 'FORBIDDEN')
    }

    campaign.status = 'CLOSED'
    campaign.closedAt = new Date()

    await campaign.save()

    return campaign
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId, userId) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    if (campaign.creatorId.toString() !== userId.toString()) {
      throw new AppError('Bạn không có quyền thao tác chiến dịch này', 403, 'FORBIDDEN')
    }

    if (campaign.status !== 'REJECTED') {
      throw new AppError('Chỉ có thể xóa chiến dịch đã bị từ chối', 400, 'VALIDATION_ERROR')
    }

    await Campaign.deleteOne({ _id: campaignId })
  }

  /**
   * Get related campaigns (similar campaigns)
   */
  async getRelatedCampaigns(campaignId, limit = 4) {
    const currentCampaign = await Campaign.findById(campaignId)
    if (!currentCampaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    const related = await Campaign.find({
      _id: { $ne: campaignId },
      status: { $in: ['ACTIVE', 'GOAL_REACHED'] },
    })
      .populate('creatorId', 'name avatar isVerified')
      .limit(limit)
      .sort({ createdAt: -1 })

    return related
  }

  /**
   * Get campaign summary (AI generated)
   */
  async getCampaignSummary(campaignId, requester = null) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    await this.assertCampaignVisibility(campaign, requester)

    const disbursements = await Disbursement.find({ campaignId })
      .lean()
      .sort({ createdAt: -1 })

    const totalDisbursed = disbursements
      .filter((d) => d.status !== 'REJECTED')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const availableAmount = Math.max(Number(campaign.currentBalance || 0) - totalDisbursed, 0)

    return {
      summary: campaign.description.substring(0, 200) + '...',
      keyPoints: [
        `Mục tiêu: ${campaign.goalAmount.toLocaleString()}đ`,
        `Đã đạt: ${campaign.currentBalance.toLocaleString()}đ`,
        `Kết thúc: ${new Date(campaign.endDate).toLocaleDateString('vi-VN')}`,
      ],
      disbursements: disbursements,
      totalDisbursed,
      availableAmount,
    }
  }

  /**
   * Get disbursement proofs for campaign
   */
  async getCampaignProofs(campaignId, requester = null) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    await this.assertCampaignVisibility(campaign, requester)

    const disbursements = await Disbursement.find({
      campaignId,
      status: { $in: ['COMPLETED', 'PENDING_VERIFY'] },
    })
      .lean()
      .sort({ createdAt: -1 })

    // Sanitize proof image arrays to remove any falsy values (null/empty)
    disbursements.forEach((d) => {
      if (Array.isArray(d.proofImages)) d.proofImages = d.proofImages.filter(Boolean)
      else d.proofImages = []

      if (Array.isArray(d.proofETags)) d.proofETags = d.proofETags.filter(Boolean)
      else d.proofETags = []
    })

    return { disbursements }
  }
}

module.exports = new CampaignService()
