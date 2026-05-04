/**
 * Campaign Module - Controller
 */

const campaignService = require('./campaign.service')
const { successResponse } = require('../../utils/response')

class CampaignController {
  /**
   * POST /api/v1/campaigns
   * Create new campaign
   */
  async create(req, res, next) {
    try {
      const campaign = await campaignService.createCampaign(req.user.id, req.user.role, req.body)
      res.status(201).json(successResponse(campaign, 'Tạo chiến dịch thành công, đang chờ duyệt'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/campaigns
   * Get campaigns list
   */
  async list(req, res, next) {
    try {
      const campaigns = await campaignService.getCampaigns(req.query.status, req.user)
      res.status(200).json(successResponse(campaigns, 'Lấy danh sách chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/campaigns/:id
   * Get campaign detail
   */
  async getById(req, res, next) {
    try {
      const { campaign, progress, totalDonations } = await campaignService.getCampaignById(req.params.id, req.user)
      res.status(200).json(
        successResponse({ campaign, progress, totalDonations }, 'Lấy thông tin chiến dịch thành công')
      )
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/campaigns/:id/donations
   * Get donations for campaign
   */
  async getDonations(req, res, next) {
    try {
      const result = await campaignService.getDonationsByCampaign(req.params.id, req.user)
      res.status(200).json(successResponse(result, 'Lấy danh sách đóng góp thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/v1/campaigns/:id/update
   * Update campaign
   */
  async update(req, res, next) {
    try {
      const campaign = await campaignService.updateCampaign(req.params.id, req.user.id, req.body)
      res.status(200).json(successResponse(campaign, 'Cập nhật chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * PUT /api/v1/campaigns/:id/close
   * Close campaign
   */
  async close(req, res, next) {
    try {
      const campaign = await campaignService.closeCampaign(req.params.id, req.user.id)
      res.status(200).json(successResponse(campaign, 'Đóng chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
    * DELETE /api/v1/campaigns/:id
    * PUT /api/v1/campaigns/:id/delete
   * Delete campaign (owner only, rejected campaigns only)
   */
  async remove(req, res, next) {
    try {
      await campaignService.deleteCampaign(req.params.id, req.user.id)
      res.status(200).json(successResponse({}, 'Xóa chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/campaigns/related/:id
   * Get related campaigns
   */
  async getRelated(req, res, next) {
    try {
      const campaigns = await campaignService.getRelatedCampaigns(req.params.id)
      res.status(200).json(successResponse(campaigns, 'Lấy chiến dịch liên quan thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/campaigns/:id/summary
   * Get campaign summary (AI)
   */
  async getSummary(req, res, next) {
    try {
      const summary = await campaignService.getCampaignSummary(req.params.id, req.user)
      res.status(200).json(successResponse(summary, 'Lấy tóm tắt chiến dịch thành công'))
    } catch (err) {
      next(err)
    }
  }

  /**
   * GET /api/v1/campaigns/:id/proofs
   * Get disbursement proofs
   */
  async getProofs(req, res, next) {
    try {
      const proofs = await campaignService.getCampaignProofs(req.params.id, req.user)
      res.status(200).json(successResponse(proofs, 'Lấy minh chứng giải ngân thành công'))
    } catch (err) {
      next(err)
    }
  }
}

module.exports = new CampaignController()
