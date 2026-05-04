/**
 * Campaign Module - Validation
 */

const AppError = require('../../utils/AppError')

const validateCampaignBody = (req, res, next) => {
  const { title, description, goalAmount, endDate, image } = req.body

  if (!title || !description || !goalAmount || !endDate || !image) {
    const error = new AppError('Vui lòng điền đầy đủ thông tin', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (goalAmount <= 0) {
    const error = new AppError('Mục tiêu quyên góp phải lớn hơn 0', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (new Date(endDate) <= new Date()) {
    const error = new AppError('Ngày kết thúc phải trong tương lai', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  next()
}

module.exports = {
  validateCampaignBody,
}
