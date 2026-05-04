const express = require('express')
const chatController = require('./chat.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

router.get('/conversations', requireAuth, chatController.listConversations)
router.post('/conversations', requireAuth, chatController.createConversation)
router.get('/conversations/:conversationId/messages', requireAuth, chatController.getMessages)
router.post('/conversations/:conversationId/messages', requireAuth, chatController.sendMessage)

module.exports = router