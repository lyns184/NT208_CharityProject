const mongoose = require('mongoose')

const videoLikeSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

videoLikeSchema.index({ videoId: 1, userId: 1 }, { unique: true })

module.exports = mongoose.model('VideoLike', videoLikeSchema)
