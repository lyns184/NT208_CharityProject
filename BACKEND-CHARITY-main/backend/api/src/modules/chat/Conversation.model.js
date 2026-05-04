const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    contextType: {
      type: String,
      enum: ['DIRECT', 'PROFILE', 'CAMPAIGN'],
      default: 'DIRECT',
    },
    contextId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage',
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

conversationSchema.index({ participants: 1, contextType: 1, contextId: 1 })

module.exports = mongoose.model('ChatConversation', conversationSchema)