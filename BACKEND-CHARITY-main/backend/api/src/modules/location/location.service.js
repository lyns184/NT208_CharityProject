const administrativeUnits = require('../../data/vietnam-administrative-units.json')
const AppError = require('../../utils/AppError')

const provinces = administrativeUnits.map(({ wards, ...province }) => province)
const provinceMap = new Map(
  administrativeUnits.map((province) => [String(province.code), province])
)

function getProvinces() {
  return provinces
}

function getWards(provinceCode) {
  const province = provinceMap.get(String(provinceCode))
  if (!province) {
    throw new AppError('Tỉnh/thành phố không hợp lệ', 404, 'LOCATION_NOT_FOUND')
  }

  return province.wards
}

function resolveLocation(location) {
  const provinceCode = Number(location?.provinceCode)
  const wardCode = Number(location?.wardCode)
  const province = provinceMap.get(String(provinceCode))
  const ward = province?.wards.find((item) => item.code === wardCode)

  if (!province || !ward) {
    throw new AppError(
      'Vui lòng chọn đúng tỉnh/thành phố và phường/xã',
      400,
      'INVALID_LOCATION'
    )
  }

  return {
    provinceCode: province.code,
    provinceName: province.name,
    wardCode: ward.code,
    wardName: ward.name,
  }
}

module.exports = {
  getProvinces,
  getWards,
  resolveLocation,
}
