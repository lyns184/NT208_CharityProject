/**
 * Centralized error handling middleware
 * Catch all errors and return standardized response
 */

const { errorResponse } = require('../utils/response')
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error('Error caught:', err.message)
  if (err.stack) {
    console.error(err.stack)
  }

  // Default error
  let statusCode = 500
  let message = 'Lỗi máy chủ nội bộ'
  let errorCode = 'INTERNAL_ERROR'

  // Validation error (Mongoose)
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = err.message || 'Dữ liệu không hợp lệ'
    errorCode = 'VALIDATION_ERROR'
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409
    message = 'Dữ liệu đã tồn tại'
    errorCode = 'CONFLICT'
  }

  // Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = 400
    message = 'ID không hợp lệ'
    errorCode = 'VALIDATION_ERROR'
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Token không hợp lệ'
    errorCode = 'UNAUTHORIZED'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token đã hết hạn'
    errorCode = 'UNAUTHORIZED'
  }

  // Custom AppError object
  if (err.statusCode && err.errorCode) {
    statusCode = err.statusCode
    message = err.message
    errorCode = err.errorCode
  }

  const response = errorResponse(message, err.message, statusCode, errorCode)

  res.status(statusCode).json(response)
}

module.exports = errorHandler
