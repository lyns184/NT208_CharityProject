/**
 * Standard API messages
 */

const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  CAMPAIGN_CREATED: 'Chiến dịch được tạo thành công',
  CAMPAIGN_UPDATED: 'Chiến dịch được cập nhật thành công',
  CAMPAIGN_CLOSED: 'Chiến dịch được đóng thành công',
  DONATION_SUCCESS: 'Đóng góp thành công',
  KYC_SUBMITTED: 'KYC được gửi thành công',
  KYC_APPROVED: 'KYC được phê duyệt',
  KYC_REJECTED: 'KYC bị từ chối',
  DISBURSEMENT_CREATED: 'Yêu cầu giải ngân được tạo thành công',
  DISBURSEMENT_TRANSFERRED: 'Tiền giải ngân được chuyển thành công',
  DISBURSEMENT_VERIFIED: 'Giải ngân được xác minh thành công',
}

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác',
  EMAIL_EXISTS: 'Email đã được đăng ký',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  UNAUTHORIZED: 'Bạn không có quyền thực hiện hành động này',
  FORBIDDEN: 'Hành động này không được phép',
  NOT_FOUND: 'Dữ liệu không tồn tại',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  KYC_NOT_APPROVED: 'Bạn cần xác minh danh tính trước',
  CAMPAIGN_NOT_ACTIVE: 'Chiến dịch không còn hoạt động',
  INSUFFICIENT_BALANCE: 'Số dư không đủ',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  INTERNAL_ERROR: 'Lỗi máy chủ nội bộ',
  INVALID_TOKEN: 'Token không hợp lệ',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  BLOCKCHAIN_ERROR: 'Lỗi blockchain',
}

module.exports = {
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
}
