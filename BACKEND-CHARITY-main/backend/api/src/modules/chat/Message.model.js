const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatConversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'VIDEO', 'OTHER'],
      default: 'TEXT',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('ChatMessage', messageSchema)