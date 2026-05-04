/**
 * Verify Module - Service & Controller (for blockchain verification)
 */

const Donation = require('../payment/Donation.model')
const AppError = require('../../utils/AppError')
const { successResponse } = require('../../utils/response')

class VerifyService {
  async verifyDonation(donationId) {
    const donation = await Donation.findById(donationId)
    if (!donation) {
      throw new AppError('Giao dịch không tồn tại', 404, 'NOT_FOUND')
    }
    return donation
  }
}

class VerifyController {
  async verifyDonation(req, res, next) {
    try {
      const donation = await new VerifyService().verifyDonation(req.params.id)
      res.json(successResponse(donation, 'Xác thực giao dịch thành công'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { VerifyService, VerifyController: new VerifyController() }
