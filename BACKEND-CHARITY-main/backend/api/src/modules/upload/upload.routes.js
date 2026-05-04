/**
 * Upload Module - Controller & Routes
 */

const express = require('express')
const router = express.Router()
const { requireAuth } = require('../../middlewares/auth')
const upload = require('../../middlewares/upload')
const cloudinary = require('../../config/cloudinary')
const { successResponse } = require('../../utils/response')

/**
 * Upload image to Cloudinary
 */
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new Error('Vui lòng chọn file ảnh')
    }

    const folder = req.body.folder
      ? `charitable-fund/${req.body.folder}`
      : 'charitable-fund'
    const isVideo = req.file.mimetype.startsWith('video/')

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: isVideo ? 'video' : 'image' },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    res.json(successResponse(
      { url: result.secure_url, etag: result.etag, resourceType: result.resource_type || (isVideo ? 'video' : 'image') },
      'Upload ảnh thành công'
    ))
  } catch (error) {
    next(error)
  }
}

router.post('/', requireAuth, upload.single('file'), uploadImage)

module.exports = router
