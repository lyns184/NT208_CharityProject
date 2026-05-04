/**
 * Campaign Module - Routes
 */

const express = require('express')
const campaignController = require('./campaign.controller')
const { requireAuth, optionalAuth } = require('../../middlewares/auth')
const { isVerified } = require('../../middlewares/campaign')
const { validateCampaignBody } = require('./campaign.validation')

const router = express.Router()

// Public routes
router.get('/', optionalAuth, campaignController.list)

// Specific routes BEFORE :id to avoid conflicts
router.get('/related/:id', campaignController.getRelated)
router.get('/:id/summary', optionalAuth, campaignController.getSummary)
router.get('/:id/proofs', optionalAuth, campaignController.getProofs)
router.get('/:id/donations', optionalAuth, campaignController.getDonations)

// ID-based routes
router.get('/:id', optionalAuth, campaignController.getById)

// Protected routes
router.post('/', requireAuth, isVerified, validateCampaignBody, campaignController.create)
router.put('/:id/update', requireAuth, validateCampaignBody, campaignController.update)
router.put('/:id/close', requireAuth, campaignController.close)
router.put('/:id/delete', requireAuth, campaignController.remove)
router.delete('/:id', requireAuth, campaignController.remove)

module.exports = router
