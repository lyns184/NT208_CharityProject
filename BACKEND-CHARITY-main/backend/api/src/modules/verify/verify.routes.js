/**
 * Verify Module - Routes
 */

const express = require('express')
const { VerifyController } = require('./verify.controller')

const router = express.Router()

router.get('/donation/:id', VerifyController.verifyDonation)

module.exports = router
