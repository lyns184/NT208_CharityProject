const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const connectDB = require('../src/config/db')
const Campaign = require('../src/modules/campaign/Campaign.model')

const DEFAULT_LOCATION = {
  provinceCode: 79,
  provinceName: 'Thành phố Hồ Chí Minh',
  wardCode: 26800,
  wardName: 'Phường Linh Xuân',
}

async function migrate() {
  await connectDB()

  const locationResult = await Campaign.updateMany(
    {
      $or: [
        { location: { $exists: false } },
        { 'location.provinceCode': { $exists: false } },
        { 'location.wardCode': { $exists: false } },
      ],
    },
    { $set: { location: DEFAULT_LOCATION } }
  )

  const lockedResult = await Campaign.updateMany(
    {
      locationLocked: { $exists: false },
      status: { $in: ['ACTIVE', 'GOAL_REACHED', 'CLOSED'] },
    },
    { $set: { locationLocked: true } }
  )

  const unlockedResult = await Campaign.updateMany(
    {
      locationLocked: { $exists: false },
      status: { $nin: ['ACTIVE', 'GOAL_REACHED', 'CLOSED'] },
    },
    { $set: { locationLocked: false } }
  )

  console.log(`Đã cập nhật địa điểm cho ${locationResult.modifiedCount} chiến dịch.`)
  console.log(`Đã khóa địa điểm cho ${lockedResult.modifiedCount} chiến dịch đã duyệt.`)
  console.log(`Đã giữ mở địa điểm cho ${unlockedResult.modifiedCount} chiến dịch chưa duyệt.`)
  process.exit(0)
}

migrate().catch((error) => {
  console.error('Migration địa điểm thất bại:', error)
  process.exit(1)
})