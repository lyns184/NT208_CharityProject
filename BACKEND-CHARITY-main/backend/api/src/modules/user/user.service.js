/**
 * User Module - Service Layer
 */

const User = require('../auth/User.model')
const Campaign = require('../campaign/Campaign.model')
const Donation = require('../payment/Donation.model')
const AppError = require('../../utils/AppError')

class UserService {
  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await User.findById(userId).select('-password -tokenBlacklist')

    // Dashboard stats
    const totalDonated = await Donation.aggregate([
      { $match: { donorId: userId, paymentStatus: 'SUCCESS' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])

    const totalDonations = await Donation.countDocuments({
      donorId: userId,
      paymentStatus: 'SUCCESS'
    })

    const totalCampaigns = await Campaign.countDocuments({
      creatorId: userId
    })

    return {
      user,
      dashboard: {
        totalDonated: totalDonated[0]?.total || 0,
        totalDonations,
        totalCampaigns
      }
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, data) {
    const { gender, dob, phone, bio, address, socialLinks, avatar } = data

    const user = await User.findByIdAndUpdate(
      userId,
      { gender, dob, phone, bio, address, socialLinks, avatar },
      { new: true }
    ).select('-password -tokenBlacklist')

    return user
  }

  /**
   * Change password
   */
  async changePassword(userId, oldPassword, newPassword) {
    const user = await User.findById(userId).select('+password')

    const isMatch = await user.comparePassword(oldPassword)
    if (!isMatch) {
      throw new AppError('Mật khẩu cũ không đúng', 400, 'VALIDATION_ERROR')
    }

    user.password = newPassword
    await user.save()

    return { message: 'Đổi mật khẩu thành công' }
  }

  /**
   * Submit KYC
   */
  async submitKyc(userId, kycData) {
    const user = await User.findById(userId)

    if (user.kycStatus === 'PENDING' || user.kycStatus === 'APPROVED') {
      throw new AppError('Hồ sơ KYC đã được nộp hoặc đã duyệt', 400, 'VALIDATION_ERROR')
    }

    const updateData = { ...kycData, kycStatus: 'PENDING' }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })

    return { message: 'Nộp hồ sơ KYC thành công, đang chờ duyệt' }
  }

  /**
   * Get user campaigns
   */
  async getMyCampaigns(userId) {
    const campaigns = await Campaign.find({ creatorId: userId }).sort({ createdAt: -1 })
    return campaigns
  }

  /**
   * Get user donations
   */
  async getMyDonations(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const donations = await Donation.find({
      donorId: userId,
      paymentStatus: 'SUCCESS'
    })
      .populate('campaignId', 'title image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Donation.countDocuments({
      donorId: userId,
      paymentStatus: 'SUCCESS'
    })

    return {
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Get organizers list
   */
  async getOrganizers(limit = 10) {
    // Aggregate users (organizations + individuals) who passed KYC/isVerified
    const pipeline = [
      {
        $match: {
          accountType: { $in: ['ORGANIZATION', 'INDIVIDUAL'] },
          isVerified: true,
          kycStatus: 'APPROVED'
        }
      },
      // Lookup campaigns created by the user
      {
        $lookup: {
          from: 'campaigns',
          localField: '_id',
          foreignField: 'creatorId',
          as: 'campaigns'
        }
      },
      // Compute totalRaised from campaign.currentBalance
      {
        $addFields: {
          totalRaised: { $sum: { $map: { input: '$campaigns', as: 'c', in: { $ifNull: ['$$c.currentBalance', 0] } } } }
        }
      },
      // Project fields to return
      {
        $project: {
          name: 1,
          avatar: 1,
          bio: 1,
          email: 1,
          createdAt: 1,
          accountType: 1,
          totalRaised: 1,
          kycStatus: 1
        }
      },
      // Sort by totalRaised desc
      { $sort: { totalRaised: -1 } },
      // Limit
      { $limit: limit }
    ]

    const organizers = await User.aggregate(pipeline)

    return organizers
  }

  /**
   * Get any user's profile (public)
   */
  async getUserProfile(userId) {
    const user = await User.findById(userId).select('-password -tokenBlacklist')
    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404, 'NOT_FOUND')
    }

    return user
  }

  /**
   * Get any user's campaigns (public)
   */
  async getUserCampaigns(userId) {
    const campaigns = await Campaign.find({
      creatorId: userId,
      status: { $in: ['ACTIVE', 'GOAL_REACHED', 'CLOSED'] },
    })
      .sort({ createdAt: -1 })
    return campaigns
  }

  /**
   * Get any user's donations (public)
   */
  async getUserDonations(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const donations = await Donation.find({
      donorId: userId,
      paymentStatus: 'SUCCESS'
    })
      .populate('campaignId', 'title image')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Donation.countDocuments({
      donorId: userId,
      paymentStatus: 'SUCCESS'
    })

    return {
      donations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}

module.exports = new UserService()
