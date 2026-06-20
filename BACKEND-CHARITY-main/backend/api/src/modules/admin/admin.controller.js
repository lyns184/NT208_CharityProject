/**
 * Admin Module - Service & Controller (Compact version)
 */

const crypto = require('crypto')
const User = require('../auth/User.model')
const Campaign = require('../campaign/Campaign.model')
const Donation = require('../payment/Donation.model')
const Disbursement = require('../disbursement/Disbursement.model')
const AppError = require('../../utils/AppError')
const { recordDisbursementOnChain } = require('../../utils/blockchain')
const { BLOCKCHAIN_STATUS } = require('../../constants/enums')
const { successResponse } = require('../../utils/response')

class AdminService {
  async getStats() {
    const [totalUsers, totalCampaigns, pendingKYC, approvedKYC] = await Promise.all([
      User.countDocuments(),
      Campaign.countDocuments(),
      User.countDocuments({ kycStatus: 'PENDING' }),
      User.countDocuments({ kycStatus: 'APPROVED' }),
    ])

    const donationAgg = await Donation.aggregate([
      { $match: { paymentStatus: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    return {
      totalUsers,
      totalCampaigns,
      totalDonations: donationAgg[0]?.total || 0,
      pendingKYC,
      approvedKYC,
    }
  }

  async getKycList() {
    return await User.find({ kycStatus: { $in: ['PENDING', 'APPROVED', 'REJECTED'] } }).select('-password -tokenBlacklist')
  }

  async approveKyc(userId, status, rejectionReason) {
    const updateData = {
      kycStatus: status,
      rejectionReason: status === 'REJECTED' ? rejectionReason || '' : ''
    }

    if (status === 'APPROVED') {
      updateData.isVerified = true
    } else if (status === 'REJECTED') {
      updateData.isVerified = false
    }

    return await User.findByIdAndUpdate(userId, updateData, { new: true })
  }

  async approveCampaign(campaignId, status, rejectionReason) {
    const normalizedStatus = typeof status === 'string' ? status.trim().toUpperCase() : ''
    const allowedStatuses = new Set(['ACTIVE', 'REJECTED'])

    if (!allowedStatuses.has(normalizedStatus)) {
      throw new AppError('Trạng thái duyệt chiến dịch không hợp lệ', 400, 'VALIDATION_ERROR')
    }

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    if (campaign.status !== 'PENDING') {
      throw new AppError('Chỉ có thể duyệt hoặc từ chối chiến dịch đang chờ duyệt', 400, 'VALIDATION_ERROR')
    }

    const trimmedReason = (rejectionReason || '').trim()
    if (normalizedStatus === 'REJECTED' && !trimmedReason) {
      throw new AppError('Vui lòng nhập lý do từ chối', 400, 'VALIDATION_ERROR')
    }

    const updateData = {
      status: normalizedStatus,
      rejectionReason: normalizedStatus === 'REJECTED' ? trimmedReason : '',
    }
    if (normalizedStatus === 'ACTIVE') {
      updateData.startedAt = new Date()
      updateData.locationLocked = true
    }
    return await Campaign.findByIdAndUpdate(campaignId, updateData, { new: true })
  }

  async confirmDisbursementTransfer(disbursementId, transferProofImage) {
    const disbursement = await Disbursement.findById(disbursementId)
    if (!disbursement) {
      throw new AppError('Yêu cầu giải ngân không tồn tại', 404, 'NOT_FOUND')
    }

    if (disbursement.status !== 'PENDING_VERIFY') {
      throw new AppError('Yêu cầu không ở trạng thái chờ chuyển', 400, 'VALIDATION_ERROR')
    }

    try {
      if (transferProofImage) disbursement.transferProofImage = transferProofImage

      const transferProofHash = crypto
        .createHash('sha256')
        .update(
          JSON.stringify({
            disbursementId: disbursement._id.toString(),
            campaignId: disbursement.campaignId.toString(),
            amount: disbursement.amount,
            reason: disbursement.reason,
            transferProofImage: transferProofImage || '',
          })
        )
        .digest('hex')

      disbursement.transferProofHash = transferProofHash

      const txHash = await recordDisbursementOnChain(
        disbursement.campaignId,
        disbursement.amount,
        transferProofHash
      )
      disbursement.transferTxHash = txHash
      disbursement.blockchainTxHash = txHash
      disbursement.blockchainStatus = BLOCKCHAIN_STATUS.SUCCESS

      disbursement.status = 'COMPLETED'

      await disbursement.save()
      return disbursement
    } catch (err) {
      disbursement.blockchainStatus = BLOCKCHAIN_STATUS.FAILED
      await disbursement.save()
      throw err
    }
  }
}

class AdminController {
  async getStats(req, res, next) {
    try {
      const stats = await new AdminService().getStats()
      res.json(successResponse(stats, 'Lấy thống kê admin thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getKycList(req, res, next) {
    try {
      const users = await new AdminService().getKycList()
      res.json(successResponse(users, 'Lấy danh sách KYC thành công'))
    } catch (err) {
      next(err)
    }
  }

  async approveKyc(req, res, next) {
    try {
      const { status, rejectionReason } = req.body
      const user = await new AdminService().approveKyc(req.params.id, status, rejectionReason)
      res.json(successResponse(user, `KYC ${status}`))
    } catch (err) {
      next(err)
    }
  }

  async approveCampaign(req, res, next) {
    try {
      const { status, rejectionReason } = req.body
      const campaign = await new AdminService().approveCampaign(req.params.id, status, rejectionReason)
      res.json(successResponse(campaign, `Campaign ${status}`))
    } catch (err) {
      next(err)
    }
  }

  async confirmDisbursementTransfer(req, res, next) {
    try {
      const { transferProofImage } = req.body || {}
      const disbursement = await new AdminService().confirmDisbursementTransfer(
        req.params.id,
        transferProofImage
      )
      res.json(successResponse(disbursement, 'Đã xác nhận chuyển khoản'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { AdminService, AdminController: new AdminController() }
