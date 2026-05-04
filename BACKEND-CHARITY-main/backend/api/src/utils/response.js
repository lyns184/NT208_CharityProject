/**
 * Standardized API response formatter
 * Ensure all endpoints return consistent response structure
 */

const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    statusCode,
    timestamp: new Date().toISOString(),
  }
}

const errorResponse = (message = 'Error', error = null, statusCode = 500, errorCode = 'INTERNAL_ERROR') => {
  return {
    success: false,
    message,
    error: errorCode,
    details: error,
    statusCode,
    timestamp: new Date().toISOString(),
  }
}

const paginatedResponse = (data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit)
  return {
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems: total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
    timestamp: new Date().toISOString(),
  }
}

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
}
