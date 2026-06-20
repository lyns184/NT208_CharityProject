const TOOL_DECLARATIONS = [
  {
    name: 'search_campaigns',
    description: 'Tìm các chiến dịch công khai theo địa điểm, tiến độ, lượt ủng hộ, hạn kết thúc hoặc cách sắp xếp.',
    parameters: {
      type: 'OBJECT',
      properties: {
        provinceName: {
          type: 'STRING',
          description: 'Tên tỉnh hoặc thành phố tại Việt Nam do người dùng nhắc đến.',
        },
        wardName: {
          type: 'STRING',
          description: 'Tên phường hoặc xã tại Việt Nam do người dùng nhắc đến.',
        },
        minProgress: {
          type: 'NUMBER',
          description: 'Tiến độ tối thiểu theo phần trăm, từ 0 đến 100.',
        },
        maxProgress: {
          type: 'NUMBER',
          description: 'Tiến độ tối đa theo phần trăm, từ 0 đến 100.',
        },
        hasDonations: {
          type: 'BOOLEAN',
          description: 'True nếu phải có lượt ủng hộ thành công, false nếu chưa có ai ủng hộ.',
        },
        endingWithinDays: {
          type: 'INTEGER',
          description: 'Chỉ lấy chiến dịch kết thúc trong số ngày sắp tới.',
        },
        sortBy: {
          type: 'STRING',
          enum: ['newest', 'progress', 'raised', 'ending_soon', 'least_supported'],
        },
        limit: {
          type: 'INTEGER',
          description: 'Số kết quả, tối đa 5.',
        },
      },
    },
  },
  {
    name: 'get_campaign_detail',
    description: 'Lấy thông tin chi tiết và số liệu công khai của một chiến dịch cụ thể.',
    parameters: {
      type: 'OBJECT',
      properties: {
        campaignId: {
          type: 'STRING',
          description: 'MongoDB ID hoặc display ID nếu người dùng cung cấp.',
        },
        campaignName: {
          type: 'STRING',
          description: 'Tên hoặc một phần tên chiến dịch.',
        },
      },
    },
  },
  {
    name: 'get_campaign_statistics',
    description: 'Tính số liệu tổng hợp của các chiến dịch công khai theo địa điểm hoặc nhóm tiêu chí.',
    parameters: {
      type: 'OBJECT',
      properties: {
        provinceName: { type: 'STRING' },
        wardName: { type: 'STRING' },
        category: {
          type: 'STRING',
          enum: ['all', 'near_goal', 'no_donations', 'ending_soon'],
        },
        endingWithinDays: { type: 'INTEGER' },
      },
    },
  },
]

module.exports = { TOOL_DECLARATIONS }
