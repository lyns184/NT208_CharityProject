const AppError = require('../../utils/AppError')
const Campaign = require('../campaign/Campaign.model')
const User = require('../auth/User.model')
const SocialPost = require('./SocialPost.model')
const SocialComment = require('./SocialComment.model')

const ALLOWED_TAGS = ['ACTIVITY', 'GIVE', 'HELP']

function normalizeMedia(media = []) {
  if (!Array.isArray(media)) return []
  return media
    .filter((item) => item && item.url)
    .map((item) => ({
      type: item.type === 'video' ? 'video' : 'image',
      url: item.url,
      etag: item.etag || '',
    }))
}

class SocialService {
  async createPost(userId, data) {
    const content = String(data.content || '').trim()
    const tag = String(data.tag || '')
    const campaignId = data.campaignId || null
    const media = normalizeMedia(data.media)

    // Enforce maximum number of media items
    if (media.length > 10) {
      throw new AppError('Chỉ được tối đa 10 tệp media', 400, 'VALIDATION_ERROR')
    }

    if (!content) {
      throw new AppError('Vui lòng nhập nội dung bài viết', 400, 'VALIDATION_ERROR')
    }

    if (!ALLOWED_TAGS.includes(tag)) {
      throw new AppError('Tag bài viết không hợp lệ', 400, 'VALIDATION_ERROR')
    }

    if (campaignId) {
      const campaign = await Campaign.findById(campaignId)
      if (!campaign) {
        throw new AppError('Chiến dịch liên kết không tồn tại', 404, 'NOT_FOUND')
      }
    }

    const post = await SocialPost.create({
      authorId: userId,
      campaignId,
      tag,
      content,
      media,
    })

    return SocialPost.findById(post._id)
      .populate('authorId', 'name avatar isVerified accountType')
      .populate('campaignId', 'title displayId image status')
  }

  async listPosts(query = {}) {
    const { feed, tag, campaignId, search = '', page = 1, limit = 10 } = query
    const filter = {}

    if (campaignId) filter.campaignId = campaignId

    if (tag && ALLOWED_TAGS.includes(tag)) {
      filter.tag = tag
    } else if (feed === 'campaign') {
      filter.tag = 'ACTIVITY'
    } else if (feed === 'inkind') {
      filter.tag = { $in: ['GIVE', 'HELP'] }
    }

    if (search) {
      filter.content = { $regex: search, $options: 'i' }
    }

    const currentPage = Math.max(parseInt(page, 10) || 1, 1)
    const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 30)

    const [posts, totalItems] = await Promise.all([
      SocialPost.find(filter)
        .populate('authorId', 'name avatar isVerified accountType')
        .populate('campaignId', 'title displayId image status')
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),
      SocialPost.countDocuments(filter),
    ])

    return {
      posts,
      pagination: {
        currentPage,
        pageSize,
        totalItems,
        totalPages: Math.max(Math.ceil(totalItems / pageSize), 1),
      },
    }
  }

  async getPostById(postId) {
    const post = await SocialPost.findById(postId)
      .populate('authorId', 'name avatar isVerified accountType')
      .populate('campaignId', 'title displayId image status')
      .lean()

    if (!post) {
      throw new AppError('Bài viết không tồn tại', 404, 'NOT_FOUND')
    }

    return { post }
  }

  async getComments(postId) {
    const comments = await SocialComment.find({ postId })
      .populate('authorId', 'name avatar isVerified accountType')
      .sort({ createdAt: 1 })
      .lean()

    return { comments }
  }

  async createComment(userId, postId, data) {
    const content = String(data.content || '').trim()
    const parentCommentId = data.parentCommentId || null

    const post = await SocialPost.findById(postId)
    if (!post) {
      throw new AppError('Bài viết không tồn tại', 404, 'NOT_FOUND')
    }

    if (!content) {
      throw new AppError('Vui lòng nhập nội dung bình luận', 400, 'VALIDATION_ERROR')
    }

    const comment = await SocialComment.create({
      postId,
      authorId: userId,
      parentCommentId,
      content,
    })

    post.commentsCount = Number(post.commentsCount || 0) + 1
    await post.save()

    return SocialComment.findById(comment._id)
      .populate('authorId', 'name avatar isVerified accountType')
      .lean()
  }
}

module.exports = new SocialService()