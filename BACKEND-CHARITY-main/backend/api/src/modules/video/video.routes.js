const express = require('express')
const videoController = require('./video.controller')
const { requireAuth, optionalAuth } = require('../../middlewares/auth')
const isVerified = require('../../middlewares/isVerified')

const router = express.Router()

router.get('/', optionalAuth, videoController.list)
router.post('/', requireAuth, isVerified, videoController.create)
router.get('/:id', optionalAuth, videoController.getById)
router.put('/:id', requireAuth, videoController.update)
router.delete('/:id', requireAuth, videoController.remove)

router.post('/:id/like', requireAuth, videoController.like)
router.delete('/:id/like', requireAuth, videoController.unlike)
router.get('/:id/comments', videoController.listComments)
router.post('/:id/comments', requireAuth, videoController.createComment)
router.post('/:id/view', videoController.recordView)

module.exports = router
