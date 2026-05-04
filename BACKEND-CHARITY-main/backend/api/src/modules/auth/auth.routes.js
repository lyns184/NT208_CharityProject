/**
 * Auth Module - Routes
 */

const express = require('express')
const authController = require('./auth.controller')
const { validateLoginBody, validateRegisterBody } = require('./auth.validation')
const auth = require('../../middlewares/auth')

const router = express.Router()

// Public routes
router.post('/login', validateLoginBody, authController.login)
router.post('/register', validateRegisterBody, authController.register)
router.post('/refresh', authController.refresh)

// Protected routes
router.post('/logout', auth.requireAuth, authController.logout)

module.exports = router
