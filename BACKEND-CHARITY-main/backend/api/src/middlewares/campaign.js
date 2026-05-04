/**
 * Campaign-specific middlewares
 */

const AppError = require('../utils/AppError')

const isVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    const error = new AppError(
      'Bạn cần xác minh KYC trước khi tạo chiến dịch',
      403,
      'FORBIDDEN'
    )
    return next(error)
  }
  next()
}

module.exports = { isVerified }
