/**
 * Admin Module - Routes
 */

const express = require('express')
const { AdminController } = require('./admin.controller')
const { requireAuth, requireAdmin } = require('../../middlewares/auth')

const router = express.Router()

router.use(requireAuth, requireAdmin)

router.get('/stats', AdminController.getStats)
router.get('/kyc-list', AdminController.getKycList)
router.put('/user/:id/kyc', AdminController.approveKyc)
router.put('/campaign/:id/approve', AdminController.approveCampaign)
router.put('/disbursement/:id/transfer', AdminController.confirmDisbursementTransfer)

module.exports = router
