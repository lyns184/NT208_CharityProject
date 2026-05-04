/**
 * Express app configuration
 * Centralize app setup
 */

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')

const errorHandler = require('./middlewares/errorHandler')

const createApp = () => {
  const app = express()

  // Security middleware
  app.use(helmet())
  app.use(cors())

  // Logging middleware
  app.use(morgan('dev'))

  // Body parser middleware
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ message: '✅ Server đang chạy!', timestamp: new Date() })
  })

  return app
}

const setupRoutes = (app, routes) => {
  // Import và setup routes ở đây
  // Ví dụ:
  // app.use('/api/v1/auth', routes.auth)
  // app.use('/api/v1/campaigns', routes.campaign)
  // ... etc
}

const setupErrorHandling = (app) => {
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route không tồn tại',
      path: req.path,
      method: req.method,
    })
  })

  // Global error handler
  app.use(errorHandler)
}

module.exports = {
  createApp,
  setupRoutes,
  setupErrorHandling,
}
