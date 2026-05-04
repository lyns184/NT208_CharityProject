/**
 * Authentication middleware
 * Verify JWT token and attach user to request
 */

const jwt = require('jsonwebtoken')
const User = require('../modules/auth/User.model')
const AppError = require('../utils/AppError')

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new AppError('Không có token, truy cập bị từ chối', 401, 'UNAUTHORIZED')
      return next(error)
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      const error = new AppError('User không tồn tại', 401, 'UNAUTHORIZED')
      return next(error)
    }

    if (user.tokenBlacklist.includes(token)) {
      const error = new AppError('Token đã bị vô hiệu hóa, vui lòng đăng nhập lại', 401, 'UNAUTHORIZED')
      return next(error)
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    let message = 'Token không hợp lệ'
    if (error.name === 'TokenExpiredError') {
      message = 'Token đã hết hạn'
    }
    const appError = new AppError(message, 401, 'UNAUTHORIZED')
    next(appError)
  }
}

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    const error = new AppError('Chỉ Admin mới có quyền này', 403, 'FORBIDDEN')
    return next(error)
  }
  next()
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      const error = new AppError('User không tồn tại', 401, 'UNAUTHORIZED')
      return next(error)
    }

    if (user.tokenBlacklist.includes(token)) {
      const error = new AppError('Token đã bị vô hiệu hóa, vui lòng đăng nhập lại', 401, 'UNAUTHORIZED')
      return next(error)
    }

    req.user = user
    req.token = token
    next()
  } catch (error) {
    let message = 'Token không hợp lệ'
    if (error.name === 'TokenExpiredError') {
      message = 'Token đã hết hạn'
    }
    const appError = new AppError(message, 401, 'UNAUTHORIZED')
    next(appError)
  }
}

module.exports = { requireAuth, requireAdmin, optionalAuth }