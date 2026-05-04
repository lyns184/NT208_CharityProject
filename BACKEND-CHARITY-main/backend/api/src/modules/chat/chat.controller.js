const chatService = require('./chat.service')
const { successResponse } = require('../../utils/response')

class ChatController {
  async listConversations(req, res, next) {
    try {
      const conversations = await chatService.listConversations(req.user.id)
      res.json(successResponse(conversations, 'Lấy danh sách hội thoại thành công'))
    } catch (error) {
      next(error)
    }
  }

  async createConversation(req, res, next) {
    try {
      const { participantId, contextType = 'DIRECT', contextId = null } = req.body
      const conversation = await chatService.createOrGetConversation(
        req.user.id,
        participantId,
        contextType,
        contextId
      )
      res.json(successResponse(conversation, 'Tạo hội thoại thành công'))
    } catch (error) {
      next(error)
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params
      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 30
      const result = await chatService.listMessages(conversationId, req.user.id, page, limit)
      res.json(successResponse(result, 'Lấy tin nhắn thành công'))
    } catch (error) {
      next(error)
    }
  }

  async sendMessage(req, res, next) {
    try {
      const { conversationId } = req.params
      const { content, type } = req.body
      const message = await chatService.sendMessage(conversationId, req.user.id, content, type)
      res.status(201).json(successResponse(message, 'Gửi tin nhắn thành công'))
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ChatController()