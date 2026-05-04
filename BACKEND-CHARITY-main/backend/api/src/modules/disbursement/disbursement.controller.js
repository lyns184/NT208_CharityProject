/**
 * Disbursement Module - Service & Controller
 */

const Disbursement = require('./Disbursement.model')
const Campaign = require('../campaign/Campaign.model')
const AppError = require('../../utils/AppError')
const { successResponse } = require('../../utils/response')

class DisbursementService {
  async requestDisbursement(userId, campaignId, data) {
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    if (campaign.creatorId.toString() !== userId.toString()) {
      throw new AppError('Bạn không có quyền yêu cầu giải ngân', 403, 'FORBIDDEN')
    }

    const { amount, reason, proofImages, requestQrImage } = data

    const reservedAmount = Number(campaign.disbursedAmount || 0)
    const currentBalance = Number(campaign.currentBalance || 0)
    const numericAmount = Number(amount || 0)

    if (!numericAmount || numericAmount <= 0) {
      throw new AppError('Vui lòng nhập số tiền giải ngân hợp lệ', 400, 'VALIDATION_ERROR')
    }

    const availableAmount = Math.max(currentBalance - reservedAmount, 0)
    if (numericAmount > availableAmount) {
      throw new AppError('Số tiền vượt quá số dư khả dụng', 400, 'VALIDATION_ERROR')
    }

    if (!requestQrImage) {
      throw new AppError('Vui lòng tải lên QR nhận tiền', 400, 'VALIDATION_ERROR')
    }

    const sanitizedProofImages = Array.isArray(proofImages) ? proofImages.filter(Boolean) : []

    const disbursement = await Disbursement.create({
      campaignId,
      amount: numericAmount,
      reason,
      requestQrImage,
      proofImages: sanitizedProofImages,
      status: 'PENDING_VERIFY'
    })

    campaign.disbursedAmount = reservedAmount + numericAmount
    await campaign.save()

    return disbursement.toObject ? disbursement.toObject() : disbursement
  }

  async addProof(disbursementId, proofImages, proofETags, proofCaption) {
    const disbursement = await Disbursement.findById(disbursementId)
    if (!disbursement) {
      throw new AppError('Yêu cầu giải ngân không tồn tại', 404, 'NOT_FOUND')
    }

    if (disbursement.status !== 'COMPLETED' && disbursement.status !== 'PENDING_VERIFY') {
      throw new AppError('Yêu cầu chưa ở trạng thái đã giải ngân', 400, 'VALIDATION_ERROR')
    }

    disbursement.proofImages = Array.isArray(proofImages) ? proofImages.filter(Boolean) : []
    disbursement.proofETags = Array.isArray(proofETags) ? proofETags.filter(Boolean) : []
    disbursement.proofCaption = String(proofCaption || '')
    await disbursement.save()

    return disbursement.toObject ? disbursement.toObject() : disbursement
  }
}

class DisbursementController {
  async request(req, res, next) {
    try {
      const disbursement = await new DisbursementService().requestDisbursement(
        req.user.id,
        req.body.campaignId,
        req.body
      )
      res.status(201).json(
        successResponse(disbursement, 'Yêu cầu giải ngân thành công')
      )
    } catch (err) {
      next(err)
    }
  }

  async addProof(req, res, next) {
    try {
      const body = req.body || {}
      const imagesRaw = body.proofImages
      const etagsRaw = body.proofETags
      const proofCaption = body.proofCaption || ''

      const proofImages = Array.isArray(imagesRaw)
        ? imagesRaw
        : imagesRaw
          ? JSON.parse(imagesRaw)
          : []
      const proofETags = Array.isArray(etagsRaw)
        ? etagsRaw
        : etagsRaw
          ? JSON.parse(etagsRaw)
          : []

      const disbursement = await new DisbursementService().addProof(
        req.params.id,
        proofImages,
        proofETags,
        proofCaption
      )
      res.json(successResponse(disbursement, 'Thêm minh chứng thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const disbursement = await Disbursement.findById(req.params.id).lean()
      if (!disbursement) {
        throw new AppError('Yêu cầu giải ngân không tồn tại', 404, 'NOT_FOUND')
      }

      // sanitize arrays
      disbursement.proofImages = Array.isArray(disbursement.proofImages)
        ? disbursement.proofImages.filter(Boolean)
        : []
      disbursement.proofETags = Array.isArray(disbursement.proofETags)
        ? disbursement.proofETags.filter(Boolean)
        : []

      res.json(successResponse(disbursement, 'Lấy yêu cầu giải ngân thành công'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { DisbursementService, DisbursementController: new DisbursementController() }
