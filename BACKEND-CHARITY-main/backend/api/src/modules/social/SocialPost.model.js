const mongoose = require('mongoose')

const socialMediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  etag: String,
}, { _id: false })

const socialPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  tag: { type: String, enum: ['ACTIVITY', 'GIVE', 'HELP'], required: true },
  content: { type: String, required: true, trim: true },
  media: { type: [socialMediaSchema], default: [] },
  commentsCount: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('SocialPost', socialPostSchema)