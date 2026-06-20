const express = require('express')
const { optionalAuth } = require('../../middlewares/auth')
const controller = require('./campaign-assistant.controller')

const router = express.Router()

router.post('/stream', optionalAuth, controller.stream)

module.exports = router
