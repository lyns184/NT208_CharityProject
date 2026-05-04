const socialService = require('./social.service')
const { successResponse } = require('../../utils/response')

class SocialController {
  async list(req, res, next) {
    try {
      const result = await socialService.listPosts(req.query)
      res.json(successResponse(result, 'Lấy danh sách bài viết thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getById(req, res, next) {
    try {
      const result = await socialService.getPostById(req.params.id)
      res.json(successResponse(result, 'Lấy bài viết thành công'))
    } catch (err) {
      next(err)
    }
  }

  async create(req, res, next) {
    try {
      const post = await socialService.createPost(req.user.id, req.body || {})
      res.status(201).json(successResponse(post, 'Tạo bài viết thành công'))
    } catch (err) {
      next(err)
    }
  }

  async getComments(req, res, next) {
    try {
      const result = await socialService.getComments(req.params.id)
      res.json(successResponse(result, 'Lấy bình luận thành công'))
    } catch (err) {
      next(err)
    }
  }

  async createComment(req, res, next) {
    try {
      const comment = await socialService.createComment(req.user.id, req.params.id, req.body || {})
      res.status(201).json(successResponse(comment, 'Tạo bình luận thành công'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new SocialController()