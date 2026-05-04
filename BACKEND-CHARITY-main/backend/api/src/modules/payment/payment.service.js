/**
 * Payment Module - Service Layer
 */

const crypto = require('crypto')
const Donation = require('./Donation.model')
const Campaign = require('../campaign/Campaign.model')
const AppError = require('../../utils/AppError')
const { recordDonationOnChain } = require('../../utils/blockchain')
const { BLOCKCHAIN_STATUS } = require('../../constants/enums')
const { ERROR_MESSAGES } = require('../../constants/messages')

class PaymentService {
  /**
   * Generate transfer content for QR code
   */
  generateTransferContent() {
    const hex = crypto.randomBytes(3).toString('hex').toUpperCase()
    return `DONATE-${hex}`
  }

  /**
   * Generate QR code URL (VietQR)
   */
  generateQrUrl(amount, transferContent) {
    const bankCode = process.env.SEPAY_BANK_CODE || 'MB'
    const accountNo = process.env.SEPAY_ACCOUNT_NO || '0123456789'
    const accountName = encodeURIComponent(process.env.SEPAY_ACCOUNT_NAME || 'OpenHeart')
    const addInfo = encodeURIComponent(transferContent)
    return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`
  }

  /**
   * Create payment
   */
  async createPayment(userId, data) {
    const { campaignId, amount, message, isAnonymous } = data

    if (!campaignId || !amount) {
      throw new AppError('Vui lòng cung cấp campaignId và số tiền', 400, 'VALIDATION_ERROR')
    }

    if (amount < 10000) {
      throw new AppError('Số tiền tối thiểu là 10.000đ', 400, 'VALIDATION_ERROR')
    }

    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      throw new AppError('Chiến dịch không tồn tại', 404, 'NOT_FOUND')
    }

    if (campaign.status !== 'ACTIVE') {
      throw new AppError('Chiến dịch không còn nhận quyên góp', 400, 'VALIDATION_ERROR')
    }

    let transferContent = this.generateTransferContent()
    while (await Donation.findOne({ transferContent })) {
      transferContent = this.generateTransferContent()
    }

    const donation = await Donation.create({
      campaignId,
      donorId: userId || null,
      amount,
      message: message || '',
      isAnonymous: isAnonymous || false,
      transferContent,
      paymentStatus: 'PENDING',
    })

    const qrUrl = this.generateQrUrl(amount, transferContent)

    return {
      payment: {
        _id: donation._id,
        qrCodeUrl: qrUrl,
        amount: donation.amount,
        transferContent,
      }
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(donationId) {
    const donation = await Donation.findById(donationId)
    if (!donation) {
      throw new AppError('Giao dịch không tồn tại', 404, 'NOT_FOUND')
    }

    return { status: donation.paymentStatus, donation }
  }

  /**
   * Handle SePay webhook
   */
  async handleWebhook(webhookData) {
    const { id } = webhookData
    const content =
      webhookData.content ||
      webhookData.transferContent ||
      webhookData.description ||
      webhookData.addInfo ||
      webhookData.memo
    const transferType = String(
      webhookData.transferType || webhookData.type || 'in'
    ).toLowerCase()
    const transferAmount =
      typeof webhookData.transferAmount === 'number'
        ? webhookData.transferAmount
        : Number(webhookData.amount ?? webhookData.money)

    // Only process incoming transfers
    if (transferType !== 'in') {
      return { success: true }
    }

    // Idempotency check
    if (id) {
      const existing = await Donation.findOne({ sepayTxId: String(id) })
      if (existing) {
        return { success: true }
      }
    }

    // Find donation by transfer content
    const normalizedContent = String(content || '').trim()
    const match = normalizedContent.match(/DONATE\s*-?\s*([A-F0-9]{6})/i)
    const transferCode = match
      ? `DONATE-${match[1].toUpperCase()}`
      : normalizedContent
    const donation = await Donation.findOne({ transferContent: transferCode })
    if (!donation) {
      console.log('Donation not found for transfer content:', transferCode)
      return { success: true }
    }

    // Update donation status
    donation.paymentStatus = 'SUCCESS'
    if (id) donation.sepayTxId = String(id)

    if (Number.isFinite(transferAmount) && transferAmount >= 10000) {
      try {
        const dataHash = crypto
          .createHash('sha256')
          .update(
            JSON.stringify({
              donationId: donation._id.toString(),
              campaignId: donation.campaignId.toString(),
              amount: transferAmount,
              transferContent: donation.transferContent,
              sepayTxId: donation.sepayTxId || '',
            })
          )
          .digest('hex')

        const txHash = await recordDonationOnChain(
          donation.campaignId,
          transferAmount,
          dataHash
        )

        donation.blockchainTxHash = txHash
        donation.blockchainStatus = BLOCKCHAIN_STATUS.SUCCESS
      } catch (err) {
        donation.blockchainStatus = BLOCKCHAIN_STATUS.FAILED
      }
    } else {
      donation.blockchainStatus = BLOCKCHAIN_STATUS.IGNORED
    }

    await donation.save()

    // Update campaign balance
    const campaign = await Campaign.findById(donation.campaignId)
    if (campaign && Number.isFinite(transferAmount)) {
      campaign.currentBalance += transferAmount
      if (campaign.currentBalance >= campaign.goalAmount) {
        campaign.status = 'GOAL_REACHED'
      }
      await campaign.save()
    }

    return { success: true }
  }
}

module.exports = new PaymentService()
