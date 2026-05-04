/**
 * Disbursement Module - Routes
 */

const express = require('express')
const { DisbursementController } = require('./disbursement.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

router.post('/request', requireAuth, DisbursementController.request)
router.post('/:id/proof', requireAuth, DisbursementController.addProof)
router.get('/:id', requireAuth, DisbursementController.getById)

module.exports = router
