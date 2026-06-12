const express = require('express')
const reportController = require('./report.controller')

const router = express.Router()

router.get('/campaigns/:id/statement.pdf', reportController.getCampaignStatementPdf)

module.exports = router
