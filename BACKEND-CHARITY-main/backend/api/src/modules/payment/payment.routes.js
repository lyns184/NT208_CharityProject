/**
 * Payment Module - Routes
 */

const express = require('express')
const paymentController = require('./payment.controller')
const { requireAuth } = require('../../middlewares/auth')

const router = express.Router()

router.post('/create', requireAuth, paymentController.create)
router.post('/webhook', paymentController.webhook)
router.get('/status/:donationId', requireAuth, paymentController.getStatus)

module.exports = router
