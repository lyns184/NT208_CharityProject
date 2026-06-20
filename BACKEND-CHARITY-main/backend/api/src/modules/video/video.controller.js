const videoService = require('./video.service')
const { successResponse } = require('../../utils/response')

class VideoController {
  async list(req, res, next) {
    try {
      const result = await videoService.list(req.query, req.user?._id)
      res.json(successResponse(result, 'Videos loaded successfully'))
    } catch (error) {
      next(error)
    }
  }

  async getById(req, res, next) {
    try {
      const video = await videoService.getById(req.params.id, req.user?._id)
      res.json(successResponse({ video }, 'Video loaded successfully'))
    } catch (error) {
      next(error)
    }
  }

  async create(req, res, next) {
    try {
      const video = await videoService.create(req.user.id, req.body || {})
      res.status(201).json(successResponse(video, 'Video created successfully'))
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const video = await videoService.update(req.params.id, req.user, req.body || {})
      res.json(successResponse(video, 'Video updated successfully'))
    } catch (error) {
      next(error)
    }
  }

  async remove(req, res, next) {
    try {
      await videoService.remove(req.params.id, req.user)
      res.json(successResponse({}, 'Video deleted successfully'))
    } catch (error) {
      next(error)
    }
  }

  async like(req, res, next) {
    try {
      const result = await videoService.like(req.params.id, req.user.id)
      res.json(successResponse(result, 'Video liked'))
    } catch (error) {
      next(error)
    }
  }

  async unlike(req, res, next) {
    try {
      const result = await videoService.unlike(req.params.id, req.user.id)
      res.json(successResponse(result, 'Video unliked'))
    } catch (error) {
      next(error)
    }
  }

  async listComments(req, res, next) {
    try {
      const result = await videoService.listComments(req.params.id)
      res.json(successResponse(result, 'Comments loaded successfully'))
    } catch (error) {
      next(error)
    }
  }

  async createComment(req, res, next) {
    try {
      const comment = await videoService.createComment(
        req.params.id,
        req.user.id,
        req.body?.content
      )
      res.status(201).json(successResponse(comment, 'Comment created successfully'))
    } catch (error) {
      next(error)
    }
  }

  async recordView(req, res, next) {
    try {
      await videoService.recordView(req.params.id)
      res.json(successResponse({}, 'View recorded'))
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new VideoController()
