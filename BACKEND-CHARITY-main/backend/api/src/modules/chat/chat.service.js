const mongoose = require('mongoose')
const Conversation = require('./Conversation.model')
const Message = require('./Message.model')
const User = require('../auth/User.model')
const AppError = require('../../utils/AppError')

const populateConversation = (query) =>
  query
    .populate({ path: 'participants', select: 'name email avatar role' })
    .populate({
      path: 'lastMessage',
      populate: { path: 'senderId', select: 'name email avatar role' },
    })

const populateMessage = (query) =>
  query.populate({ path: 'senderId', select: 'name email avatar role' })

class ChatService {
  serializeConversation(conversation, currentUserId) {
    const plainConversation = conversation?.toObject ? conversation.toObject() : conversation
    const currentId = currentUserId.toString()
    const otherParticipant = (plainConversation?.participants || []).find(
      (participant) => participant?._id?.toString() !== currentId
    ) || null

    return {
      ...plainConversation,
      otherParticipant,
    }
  }

  async ensureParticipantExists(participantId) {
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      throw new AppError('Người dùng không hợp lệ', 400, 'VALIDATION_ERROR')
    }

    const user = await User.findById(participantId).select('_id name email avatar')
    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404, 'NOT_FOUND')
    }

    return user
  }

  async createOrGetConversation(userId, participantId, contextType = 'DIRECT', contextId = null) {
    await this.ensureParticipantExists(participantId)

    if (userId.toString() === participantId.toString()) {
      throw new AppError('Không thể nhắn tin cho chính mình', 400, 'VALIDATION_ERROR')
    }

    const normalizedContextId = contextId || null

    let conversation = await populateConversation(
      Conversation.findOne({
        participants: { $all: [userId, participantId] },
        contextType,
        contextId: normalizedContextId,
      })
    )

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [userId, participantId],
        contextType,
        contextId: normalizedContextId,
        lastMessageAt: new Date(),
      })

      conversation = await populateConversation(Conversation.findById(conversation._id))
    }

    return this.serializeConversation(conversation, userId)
  }

  async listConversations(userId) {
    const conversations = await populateConversation(
      Conversation.find({ participants: userId }).sort({ lastMessageAt: -1, updatedAt: -1 })
    )

    return conversations.map((conversation) => this.serializeConversation(conversation, userId))
  }

  async getConversationById(conversationId, userId) {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new AppError('Cuộc trò chuyện không hợp lệ', 400, 'VALIDATION_ERROR')
    }

    const conversation = await populateConversation(Conversation.findById(conversationId))
    if (!conversation) {
      throw new AppError('Không tìm thấy cuộc trò chuyện', 404, 'NOT_FOUND')
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant._id.toString() === userId.toString()
    )

    if (!isParticipant) {
      throw new AppError('Bạn không có quyền truy cập cuộc trò chuyện này', 403, 'FORBIDDEN')
    }

    return this.serializeConversation(conversation, userId)
  }

  async listMessages(conversationId, userId, page = 1, limit = 30) {
    const conversation = await this.getConversationById(conversationId, userId)
    const skip = (page - 1) * limit

    const [messages, total] = await Promise.all([
      populateMessage(
        Message.find({ conversationId })
          .sort({ createdAt: 1 })
          .skip(skip)
          .limit(limit)
      ),
      Message.countDocuments({ conversationId }),
    ])

    return {
      conversation,
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  async sendMessage(conversationId, senderId, content, type = 'TEXT') {
    const trimmedContent = String(content || '').trim()

    if (!trimmedContent) {
      throw new AppError('Nội dung tin nhắn không được để trống', 400, 'VALIDATION_ERROR')
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new AppError('Cuộc trò chuyện không hợp lệ', 400, 'VALIDATION_ERROR')
    }

    const conversation = await Conversation.findById(conversationId)
    if (!conversation) {
      throw new AppError('Không tìm thấy cuộc trò chuyện', 404, 'NOT_FOUND')
    }

    const isParticipant = conversation.participants.some(
      (participant) => participant.toString() === senderId.toString()
    )

    if (!isParticipant) {
      throw new AppError('Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này', 403, 'FORBIDDEN')
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content: trimmedContent,
      type: ['IMAGE', 'VIDEO', 'OTHER'].includes(type) ? type : 'TEXT',
    })

    conversation.lastMessage = message._id
    conversation.lastMessageAt = message.createdAt
    await conversation.save()

    return populateMessage(Message.findById(message._id))
  }
}

module.exports = new ChatService()