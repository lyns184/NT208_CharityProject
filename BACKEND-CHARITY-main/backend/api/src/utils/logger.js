/**
 * Centralized logging utility
 */

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  
  if (data) {
    console.log(logMessage, data)
  } else {
    console.log(logMessage)
  }
}

const info = (message, data) => log('info', message, data)
const error = (message, data) => log('error', message, data)
const warn = (message, data) => log('warn', message, data)
const debug = (message, data) => log('debug', message, data)

module.exports = {
  info,
  error,
  warn,
  debug,
}
