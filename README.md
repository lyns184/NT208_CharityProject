# OpenHeart - Dự án Quỹ Từ Thiện (Web)

## Tổng quan
- Stack:
  - Backend: Node.js, Express, Mongoose (MongoDB), Socket.IO
  - Frontend: React + Vite, Tailwind CSS, Shadcn UI
  - Contracts: Hardhat (Ethereum/EVM)
  - Lưu trữ tệp: Cloudinary
- Mục tiêu: nền tảng gây quỹ và minh bạch chi tiêu, kèm mạng xã hội nội bộ và chat realtime.

## Cấu trúc project
- BACKEND-CHARITY-main/
  - backend/ (legacy root, ít dùng)
  - api/  - server backend chính (Express)
    - src/
      - modules/   - các module nghiệp vụ (auth, campaign, user, social, chat, upload, disbursement, admin...)
      - config/    - cấu hình DB, Cloudinary, v.v.
      - middlewares/
      - utils/
      - abi/        - ABI contract
    - package.json
- fe/  - Frontend ứng dụng React + Vite
  - src/
    - api/         - các wrapper axios cho API (upload.api.js, social.api.js...)
    - components/  - component tái sử dụng (social composer, ImageUpload, messages,...)
    - pages/       - route pages (CampaignDetail, Messages, Profile, Social...)
    - assets, hooks, contexts, constants
  - package.json
- contracts/ - smart contract (Hardhat)

## Các tính năng chính
- Quản lý chiến dịch gây quỹ (tạo, cập nhật, xem chi tiết)
- Danh sách ủng hộ, báo cáo chi tiêu, minh chứng (upload hình/vid)
- Xác thực người dùng + KYC (upload tài liệu)
- Thanh toán / tạo giao dịch
- Chat realtime giữa người dùng (Socket.IO)
- Mạng xã hội nội bộ: đăng bài có media (hình/video tối đa 10 tệp), bình luận
- Admin: duyệt KYC, duyệt chiến dịch, chuyển khoản disbursement
- Tích hợp blockchain (gọi contract để ghi nhận donation/disbursement)

