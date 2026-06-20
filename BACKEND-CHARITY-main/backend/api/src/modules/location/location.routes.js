const express = require('express')
const locationController = require('./location.controller')

const router = express.Router()

router.get('/provinces', locationController.getProvinces)
router.get('/provinces/:provinceCode/wards', locationController.getWards)

module.exports = router
