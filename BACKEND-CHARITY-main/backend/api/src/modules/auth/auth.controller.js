/**
 * Auth Module - Example Implementation
 * Sử dụng cấu trúc mới: controller -> service -> model
 */

const authService = require('./auth.service')
const { successResponse, errorResponse } = require('../../utils/response')
const AppError = require('../../utils/AppError')

class AuthController {
  /**
   * POST /api/v1/auth/login
   * Body: { email, password }
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body

      const result = await authService.login(email, password)

      return res.status(200).json(
        successResponse(result, 'Đăng nhập thành công')
      )
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/v1/auth/register
   * Body: { email, password, name, accountType }
   */
  async register(req, res, next) {
    try {
      const { email, password, name, accountType } = req.body

      const result = await authService.register({
        email,
        password,
        name,
        accountType,
      })

      return res.status(201).json(
        successResponse(result, 'Đăng ký thành công')
      )
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/v1/auth/refresh
   * Body: { refreshToken }
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body

      const result = await authService.refreshToken(refreshToken)

      return res.status(200).json(
        successResponse(result, 'Token được refresh thành công')
      )
    } catch (err) {
      next(err)
    }
  }

  /**
   * POST /api/v1/auth/logout
   * Headers: Authorization: Bearer <token>
   */
  async logout(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        throw new AppError('Không có token', 400, 'VALIDATION_ERROR')
      }

      await authService.logout(req.user.id, token)

      return res.status(200).json(
        successResponse({}, 'Đăng xuất thành công')
      )
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new AuthController()
