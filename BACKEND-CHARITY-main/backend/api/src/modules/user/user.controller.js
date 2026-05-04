/**
 * User Module - Controller
 */

const userService = require('./user.service')
const { successResponse } = require('../../utils/response')

class UserController {
  async getProfile(req, res, next) {
    try {
      const result = await userService.getProfile(req.user.id)
      res.json(successResponse(result, 'Lấy thông tin hồ sơ thành công'))
    } catch (err) {
      next(err)
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await userService.updateProfile(req.user.id, req.body)
      res.json(successResponse(user, 'Cập nhật hồ sơ thành công'))
    } catch (err) {
      next(err)
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body
      const result = await userService.changePassword(req.user.id, oldPassword, newPassword)
      res.json(successResponse(result, 'Đổi mật khẩu thành công'))
    } catch (err) {
      next(err)
    }
  }

  async submitKyc(req, res, next) {
    try {
      const result = await userService.submitKyc(req.user.id, req.body)
      res.status(201).json(successResponse({}, 'Nộp hồ sơ KYC thành công, đang chờ duyệt'))
    } catch (err) {
      next(err)
    }
  }

  async getMyCampaigns(req, res, next) {
    try {
      const campaigns = await userService.getMyCampaigns(req.user.id)
      res.json(successResponse(campaigns, 'Lấy danh sách chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getMyDonations(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const result = await userService.getMyDonations(req.user.id, page, limit)
      res.json(successResponse(result, 'Lấy danh sách đóng góp thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getOrganizers(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 10
      const organizers = await userService.getOrganizers(limit)
      res.json(successResponse(organizers, 'Lấy danh sách tổ chức thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getUserProfile(req, res, next) {
    try {
      const { userId } = req.params
      const result = await userService.getUserProfile(userId)
      res.json(successResponse(result, 'Lấy thông tin hồ sơ thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getUserCampaigns(req, res, next) {
    try {
      const { userId } = req.params
      const campaigns = await userService.getUserCampaigns(userId)
      res.json(successResponse(campaigns, 'Lấy danh sách chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getUserDonations(req, res, next) {
    try {
      const { userId } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 10
      const result = await userService.getUserDonations(userId, page, limit)
      res.json(successResponse(result, 'Lấy danh sách đóng góp thành công'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new UserController()
