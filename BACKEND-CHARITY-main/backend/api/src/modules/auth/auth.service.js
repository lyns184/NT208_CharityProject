/**
 * Auth Module - Service Layer
 * Chứa business logic, gọi model, không chứa req/res
 */

const jwt = require('jsonwebtoken')
const User = require('./User.model')
const AppError = require('../../utils/AppError')
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require('../../constants/messages')

class AuthService {
  /**
   * Login with email + password
   */
  async login(email, password) {
    // Find user
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      throw new AppError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        401,
        'UNAUTHORIZED'
      )
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      throw new AppError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        401,
        'UNAUTHORIZED'
      )
    }

    // Generate token
    const tokens = user.generateTokens()

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  /**
   * Register new user
   */
  async register(data) {
    const { email, password, name, accountType } = data

    // Check if email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new AppError(
        ERROR_MESSAGES.EMAIL_EXISTS,
        409,
        'CONFLICT'
      )
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      accountType,
    })

    await user.save()

    // Generate token
    const tokens = user.generateTokens()

    return {
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError(
        ERROR_MESSAGES.INVALID_TOKEN,
        401,
        'UNAUTHORIZED'
      )
    }

    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_REFRESH_SECRET
      const decoded = jwt.verify(refreshToken, refreshTokenSecret)
      const user = await User.findById(decoded.id)
      if (!user) {
        throw new AppError(
          ERROR_MESSAGES.USER_NOT_FOUND,
          404,
          'NOT_FOUND'
        )
      }

      const newAccessToken = user.generateTokens().accessToken
      return { accessToken: newAccessToken }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError(
        ERROR_MESSAGES.TOKEN_EXPIRED,
        401,
        'UNAUTHORIZED'
      )
    }
  }

  /**
   * Logout user
   */
  async logout(userId, token) {
    // Add token to blacklist
    await User.findByIdAndUpdate(userId, {
      $push: { tokenBlacklist: token }
    })
    return { message: 'Logged out successfully' }
  }
}

module.exports = new AuthService()
