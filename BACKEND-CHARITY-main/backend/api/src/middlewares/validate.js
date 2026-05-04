/**
 * Request validation middleware wrapper
 * Catches validation errors and passes to error handler
 */

const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.validateAsync(req.body)
      }
      if (schema.query) {
        req.query = await schema.query.validateAsync(req.query)
      }
      if (schema.params) {
        req.params = await schema.params.validateAsync(req.params)
      }
      next()
    } catch (err) {
      const error = new Error(err.details[0].message || 'Validation failed')
      error.statusCode = 400
      error.errorCode = 'VALIDATION_ERROR'
      next(error)
    }
  }
}

module.exports = validateRequest
