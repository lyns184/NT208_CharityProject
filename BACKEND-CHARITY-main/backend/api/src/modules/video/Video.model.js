const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
      index: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    duration: {
      type: Number,
      required: true,
      min: 0,
      max: 180,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'HIDDEN'],
      default: 'ACTIVE',
      index: true,
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
)

videoSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Video', videoSchema)
