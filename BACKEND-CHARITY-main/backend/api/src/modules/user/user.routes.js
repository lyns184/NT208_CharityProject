/**
 * User Module - Routes
 */

const express = require('express')
const userController = require('./user.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

router.get('/profile/me', requireAuth, userController.getProfile)
router.put('/profile/update', requireAuth, userController.updateProfile)
router.put('/password', requireAuth, userController.changePassword)
router.post('/kyc', requireAuth, userController.submitKyc)
router.get('/campaigns', requireAuth, userController.getMyCampaigns)
router.get('/donations', requireAuth, userController.getMyDonations)
router.get('/organizers', userController.getOrganizers)

// Public endpoints for viewing other users' profiles
router.get('/profile/:userId', userController.getUserProfile)
router.get('/campaigns/:userId', userController.getUserCampaigns)
router.get('/donations/:userId', userController.getUserDonations)

module.exports = router
