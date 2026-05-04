const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const User = require('../auth/User.model')
const chatService = require('./chat.service')

let ioInstance = null

const parseToken = (socket) => {
  const authToken = socket.handshake.auth?.token
  if (authToken) return authToken

  const headerToken = socket.handshake.headers.authorization
  if (headerToken?.startsWith('Bearer ')) {
    return headerToken.split(' ')[1]
  }

  return null
}

const initChatSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      credentials: true,
    },
  })

  ioInstance.use(async (socket, next) => {
    try {
      const token = parseToken(socket)
      if (!token) {
        return next(new Error('UNAUTHORIZED'))
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id)
      if (!user || user.tokenBlacklist.includes(token)) {
        return next(new Error('UNAUTHORIZED'))
      }

      socket.user = user
      socket.token = token
      next()
    } catch (error) {
      next(new Error('UNAUTHORIZED'))
    }
  })

  ioInstance.on('connection', (socket) => {
    socket.on('conversation:join', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`)
      }
    })

    socket.on('conversation:leave', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`)
      }
    })

    socket.on('message:send', async (payload = {}, ack) => {
      try {
        const { conversationId, content, type } = payload
        const message = await chatService.sendMessage(conversationId, socket.user._id, content, type)
        ioInstance.to(`conversation:${conversationId}`).emit('message:new', message)

        if (typeof ack === 'function') {
          ack({ success: true, data: message })
        }
      } catch (error) {
        if (typeof ack === 'function') {
          ack({ success: false, message: error.message })
        }
      }
    })
  })

  return ioInstance
}

const getChatIO = () => ioInstance

module.exports = {
  initChatSocket,
  getChatIO,
}