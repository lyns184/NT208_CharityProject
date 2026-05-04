/**
 * Auth Module - Validation Schema
 */

const AppError = require('../../utils/AppError')

const validateLoginBody = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    const error = new AppError('Email và password là bắt buộc', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (!email.includes('@')) {
    const error = new AppError('Email không hợp lệ', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (password.length < 6) {
    const error = new AppError('Mật khẩu phải có ít nhất 6 ký tự', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  next()
}

const validateRegisterBody = (req, res, next) => {
  const { email, password, name, accountType } = req.body

  if (!email || !password || !name) {
    const error = new AppError('Email, mật khẩu và tên là bắt buộc', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (!email.includes('@')) {
    const error = new AppError('Email không hợp lệ', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (password.length < 6) {
    const error = new AppError('Mật khẩu phải có ít nhất 6 ký tự', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  if (accountType && !['INDIVIDUAL', 'ORGANIZATION'].includes(accountType)) {
    const error = new AppError('Loại tài khoản không hợp lệ', 400, 'VALIDATION_ERROR')
    return next(error)
  }

  next()
}

module.exports = {
  validateLoginBody,
  validateRegisterBody,
}
