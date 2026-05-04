const mongoose = require('mongoose')

const socialCommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialPost', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: 'SocialComment', default: null },
  content: { type: String, required: true, trim: true },
}, { timestamps: true })

module.exports = mongoose.model('SocialComment', socialCommentSchema)