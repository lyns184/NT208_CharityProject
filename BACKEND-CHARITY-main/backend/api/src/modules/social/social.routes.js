const express = require('express')
const socialController = require('./social.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

router.get('/posts', socialController.list)
router.post('/posts', requireAuth, socialController.create)
router.get('/posts/:id', socialController.getById)
router.get('/posts/:id/comments', socialController.getComments)
router.post('/posts/:id/comments', requireAuth, socialController.createComment)

module.exports = router