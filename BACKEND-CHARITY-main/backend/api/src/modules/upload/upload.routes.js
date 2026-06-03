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
 * Upload one or multiple files to Cloudinary
 * Accepts either field `file` (single) or `files` (multiple, up to multer maxCount)
 */
const uploadImage = async (req, res, next) => {
  try {
    const files = []
    if (req.file) files.push(req.file)
    if (req.files) {
      // multer.fields() will set req.files as an object mapping fieldname -> array
      if (Array.isArray(req.files)) {
        files.push(...req.files)
      } else {
        if (req.files.file) files.push(...req.files.file)
        if (req.files.files) files.push(...req.files.files)
      }
    }

    if (!files || files.length === 0) {
      throw new Error('Vui lòng chọn tệp để tải lên')
    }

    const folder = req.body.folder
      ? `charitable-fund/${req.body.folder}`
      : 'charitable-fund'

    const uploadOne = (file) => new Promise((resolve, reject) => {
      const isVideo = file.mimetype && file.mimetype.startsWith('video/')
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: isVideo ? 'video' : 'image' },
        (error, result) => {
          if (error) reject(error)
          else resolve({ result, isVideo })
        }
      )
      stream.end(file.buffer)
    })

    const rawResults = await Promise.all(files.map(uploadOne))

    const payload = rawResults.map(({ result, isVideo }) => ({
      url: result.secure_url,
      etag: result.etag,
      resourceType: result.resource_type || (isVideo ? 'video' : 'image'),
    }))

    res.json(successResponse(payload, 'Upload tệp thành công'))
  } catch (error) {
    next(error)
  }
}

// Accept either a single `file` or multiple `files` (max 10)
router.post('/', requireAuth, upload.fields([{ name: 'file', maxCount: 1 }, { name: 'files', maxCount: 10 }]), uploadImage)

module.exports = router
