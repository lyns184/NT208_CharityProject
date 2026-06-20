const locationService = require('./location.service')
const { successResponse } = require('../../utils/response')

class LocationController {
  getProvinces(req, res, next) {
    try {
      res.status(200).json(
        successResponse(locationService.getProvinces(), 'Lấy danh sách tỉnh/thành phố thành công')
      )
    } catch (error) {
      next(error)
    }
  }

  getWards(req, res, next) {
    try {
      res.status(200).json(
        successResponse(
          locationService.getWards(req.params.provinceCode),
          'Lấy danh sách phường/xã thành công'
        )
      )
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new LocationController()
