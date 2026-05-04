/**
 * Payment Module - Controller
 */

const paymentService = require('./payment.service')
const { successResponse } = require('../../utils/response')
const AppError = require('../../utils/AppError')

class PaymentController {
  async create(req, res, next) {
    try {
      const result = await paymentService.createPayment(req.user.id, req.body)
      res.status(201).json(
        successResponse(result, 'Đã tạo giao dịch, vui lòng quét mã QR để thanh toán')
      )
    } catch (err) {
      next(err)
    }
  }

  async webhook(req, res, next) {
    try {
      console.log('SEPAY WEBHOOK:', req.headers, req.body)
      // Verify secret
      const authHeader =
        req.headers['authorization'] ||
        req.headers['x-api-key'] ||
        req.headers['apikey'] ||
        ''
      const secret = String(authHeader).replace(/^(Apikey|Bearer)\s+/i, '').trim()

      if (secret !== process.env.SEPAY_WEBHOOK_SECRET) {
        const error = new AppError('Forbidden', 403, 'FORBIDDEN')
        return next(error)
      }

      await paymentService.handleWebhook(req.body)
      res.status(200).json({ success: true })
    } catch (err) {
      next(err)
    }
  }

  async getStatus(req, res, next) {
    try {
      const result = await paymentService.getPaymentStatus(req.params.donationId)
      res.json(successResponse(result, 'Lấy trạng thái giao dịch thành công'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new PaymentController()
