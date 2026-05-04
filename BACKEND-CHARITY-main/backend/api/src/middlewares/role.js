/**
 * Role-based access control middleware
 */

const { USER_ROLE } = require('../constants/enums')
const { errorResponse } = require('../utils/response')

const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLE.ADMIN) {
    return res.status(403).json(
      errorResponse('Bạn không có quyền truy cập', null, 403, 'FORBIDDEN')
    )
  }
  next()
}

const isUser = (req, res, next) => {
  if (!req.user || req.user.role !== USER_ROLE.USER) {
    return res.status(403).json(
      errorResponse('Bạn không có quyền truy cập', null, 403, 'FORBIDDEN')
    )
  }
  next()
}

module.exports = { isAdmin, isUser }
