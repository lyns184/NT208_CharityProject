const mongoose = require('mongoose')
const Video = require('./Video.model')
const VideoLike = require('./VideoLike.model')
const VideoComment = require('./VideoComment.model')
const Campaign = require('../campaign/Campaign.model')
const AppError = require('../../utils/AppError')

const populateVideo = (query) =>
  query
    .populate('authorId', 'name avatar isVerified accountType')
    .populate('campaignId', 'title displayId image status')

class VideoService {
  async ensureCampaignIsPublic(campaignId) {
    if (!campaignId) return null
    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      throw new AppError('Campaign ID is invalid', 400, 'VALIDATION_ERROR')
    }

    const campaign = await Campaign.findOne({
      _id: campaignId,
      status: { $in: ['ACTIVE', 'GOAL_REACHED', 'CLOSED'] },
    }).select('_id')

    if (!campaign) {
      throw new AppError('Campaign not found', 404, 'NOT_FOUND')
    }
    return campaign._id
  }

  async serializeVideos(videos, requesterId = null) {
    const plainVideos = videos.map((video) =>
      typeof video.toObject === 'function' ? video.toObject() : video
    )

    if (!requesterId || !plainVideos.length) {
      return plainVideos.map((video) => ({ ...video, likedByMe: false }))
    }

    const liked = await VideoLike.find({
      videoId: { $in: plainVideos.map((video) => video._id) },
      userId: requesterId,
    }).select('videoId')
    const likedIds = new Set(liked.map((item) => item.videoId.toString()))

    return plainVideos.map((video) => ({
      ...video,
      likedByMe: likedIds.has(video._id.toString()),
    }))
  }

  async list(query = {}, requesterId = null) {
    const page = Math.max(Number.parseInt(query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 30)
    const filter = { status: 'ACTIVE' }

    if (query.authorId) filter.authorId = query.authorId
    if (query.campaignId) filter.campaignId = query.campaignId

    const [videos, totalItems] = await Promise.all([
      populateVideo(
        Video.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
      ),
      Video.countDocuments(filter),
    ])

    return {
      videos: await this.serializeVideos(videos, requesterId),
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / limit), 1),
      },
    }
  }

  async getById(videoId, requesterId = null) {
    const video = await populateVideo(
      Video.findOne({ _id: videoId, status: 'ACTIVE' })
    )
    if (!video) throw new AppError('Video not found', 404, 'NOT_FOUND')

    const [serialized] = await this.serializeVideos([video], requesterId)
    return serialized
  }

  async create(userId, data) {
    const caption = String(data.caption || '').trim()
    const videoUrl = String(data.videoUrl || '').trim()
    const thumbnailUrl = String(data.thumbnailUrl || '').trim()
    const duration = Number(data.duration)

    if (!caption || !videoUrl || !thumbnailUrl) {
      throw new AppError('Caption, video and thumbnail are required', 400, 'VALIDATION_ERROR')
    }
    if (!Number.isFinite(duration) || duration <= 0 || duration > 180) {
      throw new AppError('Video duration must be between 1 and 180 seconds', 400, 'VALIDATION_ERROR')
    }

    const campaignId = await this.ensureCampaignIsPublic(data.campaignId || null)
    const video = await Video.create({
      authorId: userId,
      campaignId,
      videoUrl,
      thumbnailUrl,
      caption,
      duration,
    })

    return populateVideo(Video.findById(video._id))
  }

  async update(videoId, requester, data) {
    const video = await Video.findById(videoId)
    if (!video) throw new AppError('Video not found', 404, 'NOT_FOUND')

    const isOwner = video.authorId.toString() === requester.id.toString()
    if (!isOwner && requester.role !== 'ADMIN') {
      throw new AppError('You cannot edit this video', 403, 'FORBIDDEN')
    }

    if (data.caption !== undefined) {
      const caption = String(data.caption || '').trim()
      if (!caption) throw new AppError('Caption is required', 400, 'VALIDATION_ERROR')
      video.caption = caption
    }
    if (data.campaignId !== undefined) {
      video.campaignId = await this.ensureCampaignIsPublic(data.campaignId || null)
    }

    await video.save()
    return populateVideo(Video.findById(video._id))
  }

  async remove(videoId, requester) {
    const video = await Video.findById(videoId)
    if (!video) throw new AppError('Video not found', 404, 'NOT_FOUND')

    const isOwner = video.authorId.toString() === requester.id.toString()
    if (!isOwner && requester.role !== 'ADMIN') {
      throw new AppError('You cannot delete this video', 403, 'FORBIDDEN')
    }

    await Promise.all([
      Video.deleteOne({ _id: videoId }),
      VideoLike.deleteMany({ videoId }),
      VideoComment.deleteMany({ videoId }),
    ])
  }

  async like(videoId, userId) {
    const video = await Video.findOne({ _id: videoId, status: 'ACTIVE' })
    if (!video) throw new AppError('Video not found', 404, 'NOT_FOUND')

    const result = await VideoLike.updateOne(
      { videoId, userId },
      { $setOnInsert: { videoId, userId } },
      { upsert: true }
    )
    if (result.upsertedCount > 0) {
      await Video.updateOne({ _id: videoId }, { $inc: { likesCount: 1 } })
    }

    const updated = await Video.findById(videoId).select('likesCount')
    return { liked: true, likesCount: updated.likesCount }
  }

  async unlike(videoId, userId) {
    const result = await VideoLike.deleteOne({ videoId, userId })
    if (result.deletedCount > 0) {
      await Video.updateOne({ _id: videoId }, [
        {
          $set: {
            likesCount: { $max: [0, { $subtract: ['$likesCount', 1] }] },
          },
        },
      ])
    }

    const updated = await Video.findById(videoId).select('likesCount')
    if (!updated) throw new AppError('Video not found', 404, 'NOT_FOUND')
    return { liked: false, likesCount: Math.max(updated.likesCount, 0) }
  }

  async listComments(videoId) {
    const exists = await Video.exists({ _id: videoId, status: 'ACTIVE' })
    if (!exists) throw new AppError('Video not found', 404, 'NOT_FOUND')

    const comments = await VideoComment.find({ videoId })
      .populate('authorId', 'name avatar isVerified accountType')
      .sort({ createdAt: 1 })
      .lean()
    return { comments }
  }

  async createComment(videoId, userId, contentValue) {
    const content = String(contentValue || '').trim()
    if (!content) throw new AppError('Comment is required', 400, 'VALIDATION_ERROR')

    const video = await Video.findOne({ _id: videoId, status: 'ACTIVE' })
    if (!video) throw new AppError('Video not found', 404, 'NOT_FOUND')

    const comment = await VideoComment.create({
      videoId,
      authorId: userId,
      content,
    })
    await Video.updateOne({ _id: videoId }, { $inc: { commentsCount: 1 } })

    return VideoComment.findById(comment._id)
      .populate('authorId', 'name avatar isVerified accountType')
      .lean()
  }

  async recordView(videoId) {
    const result = await Video.updateOne(
      { _id: videoId, status: 'ACTIVE' },
      { $inc: { viewsCount: 1 } }
    )
    if (!result.matchedCount) throw new AppError('Video not found', 404, 'NOT_FOUND')
  }
}

module.exports = new VideoService()
