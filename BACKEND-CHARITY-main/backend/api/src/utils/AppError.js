/**
 * Custom error class for consistency
 */

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.timestamp = new Date().toISOString()
    
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = AppError
