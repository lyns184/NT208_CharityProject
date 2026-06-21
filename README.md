# OpenHeart

OpenHeart là nền tảng gây quỹ thiện nguyện trên web, kết nối nhà hảo tâm, chủ dự án và quản trị viên trong một quy trình minh bạch từ tạo chiến dịch, tiếp nhận quyên góp đến giải ngân và công khai dòng tiền.

Hệ thống gồm ứng dụng React, REST API Node.js/Express, MongoDB, Socket.IO, Cloudinary, SePay, Gemini và tích hợp blockchain tùy chọn.

## Mục lục

- [Tính năng chính](#tính-năng-chính)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và chạy local](#cài-đặt-và-chạy-local)
- [Biến môi trường](#biến-môi-trường)
- [Dữ liệu địa điểm](#dữ-liệu-địa-điểm)
- [Chatbot chiến dịch](#chatbot-chiến-dịch)
- [API chính](#api-chính)
- [Scripts](#scripts)
- [Kiểm tra chất lượng](#kiểm-tra-chất-lượng)


## Tính năng chính

### Người dùng và xác thực

- Đăng ký, đăng nhập, refresh token và đăng xuất.
- Hồ sơ cá nhân hoặc tổ chức.
- Đổi mật khẩu, cập nhật avatar và thông tin tài khoản.
- KYC trước khi tạo chiến dịch hoặc tải video.
- Phân quyền người dùng và quản trị viên.

### Chiến dịch gây quỹ

- Tạo, cập nhật, đóng hoặc xóa chiến dịch theo trạng thái.
- Quy trình duyệt chiến dịch bởi quản trị viên.
- Theo dõi mục tiêu, số dư, tiến độ và thời gian còn lại.
- Địa điểm bắt buộc theo danh mục hành chính Việt Nam hai cấp:
  `Tỉnh/Thành phố -> Phường/Xã`.
- Khóa địa điểm sau khi chiến dịch được duyệt.
- Tìm kiếm, sắp xếp và lọc chiến dịch theo tỉnh/thành phố.
- Hiển thị chiến dịch liên quan và hoạt động của chủ dự án.

### Quyên góp và giải ngân

- Tạo giao dịch quyên góp và nội dung chuyển khoản.
- Nhận webhook, cập nhật trạng thái thanh toán thành công/thất bại.
- Hỗ trợ quyên góp ẩn danh.
- Chủ dự án gửi yêu cầu giải ngân kèm lý do và mã QR.
- Quản trị viên xác nhận chuyển khoản.
- Chủ dự án bổ sung minh chứng sử dụng quỹ.
- Công khai số liệu quyên góp và giải ngân phù hợp với quyền truy cập.

### Bảng chi tiết giao dịch PDF

- Sinh PDF từ dữ liệu trong hệ thống, không phụ thuộc sao kê ngân hàng thật.
- Hiển thị thông tin chiến dịch, dòng tiền vào và dòng tiền đã giải ngân.
- Hỗ trợ tiếng Việt và tải trực tiếp từ trang chi tiết chiến dịch.

### Cộng đồng

- Đăng bài viết độc lập với video feed.
- Bài viết có nội dung, hình ảnh hoặc video.
- Bình luận và gắn chiến dịch vào hoạt động cộng đồng.

### Video feed

- Module video độc lập với bài viết cộng đồng.
- Giao diện ba cột trên desktop và video tràn màn hình trên mobile.
- Snap scrolling, tự phát/tạm dừng bằng `IntersectionObserver`.
- Đồng bộ trạng thái mute/unmute toàn feed.
- Tải video, ảnh thumbnail, caption và liên kết chiến dịch.
- Thả tim, bình luận, ghi nhận lượt xem và double-tap trên mobile.
- Chủ video hoặc admin có thể chỉnh sửa/xóa video.

### Chat và chatbot

- Nhắn tin realtime giữa người dùng qua Socket.IO.
- Trợ lý chiến dịch dùng Gemini và dữ liệu MongoDB.
- Trả lời câu hỏi về địa điểm, tiến độ, lượt quyên góp, ngày kết thúc và giải ngân công khai.
- Hiển thị campaign card ngay trong câu trả lời.
- Streaming qua Server-Sent Events (SSE).
- Giới hạn lượt hỏi theo tài khoản hoặc IP.
- Các câu hỏi phổ biến được truy vấn trực tiếp từ database để phản hồi nhanh và vẫn hoạt động khi Gemini tạm hết quota.

### Quản trị

- Dashboard thống kê.
- Duyệt hoặc từ chối KYC.
- Duyệt hoặc từ chối chiến dịch.
- Xác nhận giải ngân.
- Truy cập các dữ liệu quản trị theo middleware phân quyền.

## Kiến trúc hệ thống

```text
Browser
  |
  |-- React + Vite + Tailwind CSS
  |       |-- REST API: /api/v1/*
  |       |-- Socket.IO: realtime chat
  |       `-- SSE: campaign assistant
  |
Node.js + Express
  |-- Auth / User / KYC
  |-- Campaign / Donation / Disbursement
  |-- Social / Video / Chat
  |-- Report PDF / Location / Assistant
  |
  |-- MongoDB: dữ liệu nghiệp vụ
  |-- Cloudinary: hình ảnh và video
  |-- SePay: thanh toán và webhook
  |-- Gemini: hiểu ý định chatbot
  `-- EVM contract: ghi nhận tùy chọn
```

Backend được tổ chức theo module. Mỗi module thường gồm model, service, controller và routes; frontend tách API client, hooks, context, components và pages.

## Công nghệ sử dụng

### Frontend

- React 19
- Vite 7
- React Router 7
- Tailwind CSS 4
- Radix UI / shadcn
- Axios
- Socket.IO Client
- Lucide React
- Sonner

### Backend

- Node.js
- Express 5
- MongoDB và Mongoose 9
- JWT và bcryptjs
- Socket.IO
- Multer và Cloudinary
- Puppeteer để tạo PDF
- Ethers cho tích hợp EVM
- Gemini REST API
- Node Cron

### Hạ tầng tích hợp

- MongoDB Atlas hoặc MongoDB tương thích.
- Cloudinary cho media.
- SePay cho luồng chuyển khoản/webhook.
- Gemini 3.5 Flash cho chatbot.
- Ethereum/EVM RPC và smart contract là phần tùy chọn.

## Cấu trúc thư mục

```text
WebThienNguyen/
|-- README.md
|-- fe/                                  # React frontend
|   |-- src/
|   |   |-- api/                         # API clients
|   |   |-- components/                  # UI và component theo domain
|   |   |-- constants/
|   |   |-- contexts/
|   |   |-- hooks/
|   |   |-- lib/
|   |   `-- pages/
|   |-- package.json
|   `-- vite.config.js
|
`-- BACKEND-CHARITY-main/
    |-- backend/api/                     # Backend chính
    |   |-- scripts/                     # Migration scripts
    |   |-- src/
    |   |   |-- config/
    |   |   |-- data/                    # Snapshot địa giới Việt Nam
    |   |   |-- middlewares/
    |   |   |-- modules/
    |   |   `-- utils/
    |   |-- .env.example
    |   |-- package.json
    |   `-- server.js
    `-- contracts/                       # Hardhat smart contract workspace
```

Các module backend chính:

```text
auth, user, admin, campaign, payment, disbursement,
social, video, chat, upload, report, location,
campaign-assistant, verify
```

## Yêu cầu hệ thống

- Node.js 20 trở lên.
- npm 10 trở lên.
- MongoDB local hoặc MongoDB Atlas.
- Tài khoản Cloudinary cho chức năng upload.
- Cấu hình SePay nếu cần chạy thanh toán thật.
- Gemini API key nếu dùng chatbot với câu hỏi tự do.

Kiểm tra môi trường:

```bash
node --version
npm --version
```

## Cài đặt và chạy local

### 1. Clone repository

```bash
git clone <repository-url>
cd WebThienNguyen
```

### 2. Cài và cấu hình backend

```bash
cd BACKEND-CHARITY-main/backend/api
npm install
cp .env.example .env
```

Trên PowerShell:

```powershell
Copy-Item .env.example .env
```

Điền các biến cần thiết trong `.env`, sau đó chạy:

```bash
npm run dev
```

Hoặc chạy không có nodemon:

```bash
npm run start
```

Backend mặc định hoạt động tại:

```text
http://localhost:5000
```

### 3. Cài và chạy frontend

Mở terminal khác từ thư mục gốc:

```bash
cd fe
npm install
npm run dev
```

Frontend mặc định hoạt động tại:

```text
http://localhost:5173
```

Vite proxy các request `/api` đến `http://localhost:5000`, vì vậy backend phải chạy trước hoặc đồng thời với frontend.

### 4. Tài khoản và dữ liệu ban đầu

- Đăng ký tài khoản từ giao diện.
- Gửi KYC để có quyền tạo chiến dịch hoặc video.
- Quyền admin phải được cấu hình trong database phù hợp với môi trường của dự án.
- Không commit dữ liệu tài khoản mẫu hoặc credentials vào repository.

## Biến môi trường

File mẫu backend nằm tại:

```text
BACKEND-CHARITY-main/backend/api/.env.example
```

### Server và database

| Biến | Bắt buộc | Mô tả |
|---|---:|---|
| `PORT` | Không | Cổng backend, mặc định `5000` |
| `MONGO_URI` | Có | MongoDB connection string |
| `CLIENT_ORIGIN` | Khuyến nghị | Origin frontend được phép kết nối Socket.IO |

### Authentication

| Biến | Bắt buộc | Mô tả |
|---|---:|---|
| `JWT_SECRET` | Có | Secret ký access token |
| `JWT_REFRESH_SECRET` | Có | Secret ký refresh token |

Một số đoạn code cũ vẫn hỗ trợ fallback `REFRESH_TOKEN_SECRET`; cấu hình mới nên dùng `JWT_REFRESH_SECRET` như `.env.example`.

### Cloudinary

| Biến | Bắt buộc | Mô tả |
|---|---:|---|
| `CLOUDINARY_CLOUD_NAME` | Khi upload | Cloud name |
| `CLOUDINARY_API_KEY` | Khi upload | API key |
| `CLOUDINARY_API_SECRET` | Khi upload | API secret |

### SePay

| Biến | Bắt buộc | Mô tả |
|---|---:|---|
| `SEPAY_API_KEY` | Khi tích hợp | API key SePay |
| `SEPAY_WEBHOOK_SECRET` | Khi dùng webhook | Secret xác minh webhook |
| `SEPAY_BANK_CODE` | Khi thanh toán | Mã ngân hàng |
| `SEPAY_ACCOUNT_NO` | Khi thanh toán | Số tài khoản nhận tiền |
| `SEPAY_ACCOUNT_NAME` | Khi thanh toán | Tên chủ tài khoản |

### Blockchain tùy chọn

| Biến | Bắt buộc | Mô tả |
|---|---:|---|
| `RPC_URL` | Khi bật blockchain | EVM RPC endpoint |
| `PRIVATE_KEY` | Khi bật blockchain | Private key của ví backend |
| `CONTRACT_ADDRESS` | Khi bật blockchain | Địa chỉ smart contract |
| `ETHERSCAN_API_KEY` | Tùy luồng | API key block explorer |

### Campaign Assistant

| Biến | Bắt buộc | Mô tả |
|---|---:|---|
| `GEMINI_API_KEY` | Khi dùng Gemini | Gemini API key, chỉ đặt ở backend |
| `GEMINI_MODEL` | Không | Model, hiện dùng `gemini-3.5-flash` |
| `CAMPAIGN_ASSISTANT_GUEST_DAILY_LIMIT` | Không | Lượt/ngày cho khách, mặc định `10` |
| `CAMPAIGN_ASSISTANT_USER_DAILY_LIMIT` | Không | Lượt/ngày cho thành viên, mặc định `30` |

### Frontend tùy chọn

Tạo `fe/.env` khi cần thay default:

```env
VITE_SOCKET_URL=http://localhost:5000
VITE_ETHERSCAN_BASE_URL=https://sepolia.etherscan.io
```

Không đặt Gemini key, MongoDB URI, JWT secret hoặc private key blockchain trong frontend.

## Dữ liệu địa điểm

OpenHeart sử dụng snapshot địa giới hành chính Việt Nam trong backend:

```text
backend/api/src/data/vietnam-administrative-units.json
```

Dữ liệu hiện gồm 34 tỉnh/thành và 3.321 phường/xã theo mô hình hành chính hai cấp. Backend luôn kiểm tra cặp `provinceCode` và `wardCode`; frontend không cho nhập địa điểm tự do khi tạo chiến dịch.

Campaign lưu cả mã và snapshot tên:

```json
{
  "location": {
    "provinceCode": 68,
    "provinceName": "Tỉnh Lâm Đồng",
    "wardCode": 22960,
    "wardName": "Phường Bình Thuận"
  }
}
```

Địa danh cũ hoặc cách gọi quen thuộc được assistant ánh xạ về đơn vị hiện hành khi có thể, ví dụ khu vực Thủ Đức cũ hoặc tỉnh Bình Thuận cũ.

### Migration campaign cũ

Chỉ chạy khi database có campaign được tạo trước lúc bổ sung trường `location`:

```bash
cd BACKEND-CHARITY-main/backend/api
npm run migrate:campaign-locations
```

Script idempotent: có thể chạy lại mà không ghi đè campaign đã có địa điểm hợp lệ.

## Chatbot chiến dịch

Endpoint:

```text
POST /api/v1/campaign-assistant/stream
```

Request:

```json
{
  "message": "Có chiến dịch nào ở Lâm Đồng?",
  "history": []
}
```

Response sử dụng SSE với các event:

- `status`: trạng thái xử lý hiện tại.
- `meta`: quota và campaign cards.
- `delta`: nội dung trả lời từng phần.
- `done`: disclaimer và thời gian cập nhật.
- `error`: lỗi xảy ra sau khi stream đã bắt đầu.

Assistant không được truy vấn MongoDB tùy ý. Gemini chỉ chọn các tool có schema cố định; backend mới thực hiện aggregation và giới hạn dữ liệu công khai.

Các nhóm câu hỏi phổ biến được hiểu trực tiếp để phản hồi nhanh:

- Chiến dịch theo tỉnh, phường hoặc khu vực cũ.
- Chiến dịch chưa có lượt quyên góp thành công.
- Chiến dịch đạt từ 80% đến dưới 100% mục tiêu.
- Chiến dịch kết thúc trong 7 ngày tới.

## API chính

Base path:

```text
/api/v1
```

| Nhóm | Prefix | Chức năng |
|---|---|---|
| Authentication | `/auth` | Đăng ký, đăng nhập, refresh, logout |
| User/KYC | `/user` | Hồ sơ, KYC, campaign và donation của người dùng |
| Campaign | `/campaigns` | CRUD, danh sách, chi tiết, donations, proofs, summary |
| Payment | `/payment` | Tạo donation, webhook, trạng thái thanh toán |
| Disbursement | `/disbursement` | Yêu cầu và minh chứng giải ngân |
| Admin | `/admin` | Dashboard, duyệt KYC/campaign, xác nhận giải ngân |
| Social | `/social` | Bài viết và bình luận cộng đồng |
| Video | `/videos` | Feed, upload, like, comment, view |
| Chat | `/chat` | Conversation và messages |
| Upload | `/upload` | Upload media lên Cloudinary |
| Reports | `/reports` | PDF bảng chi tiết giao dịch |
| Locations | `/locations` | Tỉnh/thành và phường/xã |
| Assistant | `/campaign-assistant` | Chatbot chiến dịch qua SSE |
| Verify | `/verify` | Xác minh donation/disbursement công khai |

Các route được bảo vệ sử dụng JWT Bearer token:

```http
Authorization: Bearer <access-token>
```

## Scripts

### Backend

Chạy trong `BACKEND-CHARITY-main/backend/api`:

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy backend bằng nodemon |
| `npm run start` | Chạy backend bằng Node.js |
| `npm run migrate:campaign-locations` | Migration địa điểm campaign cũ |

### Frontend

Chạy trong `fe`:

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy Vite dev server |
| `npm run build` | Build production vào `fe/dist` |
| `npm run preview` | Xem thử production build |
| `npm run lint` | Chạy ESLint |

## Kiểm tra chất lượng

Trước khi tạo pull request hoặc deploy:

```bash
cd fe
npm run lint
npm run build
```

Kiểm tra backend có thể thực hiện bằng Node syntax check:

```bash
cd BACKEND-CHARITY-main/backend/api
node --check server.js
```

Checklist smoke test khuyến nghị:

1. Đăng ký, đăng nhập và refresh token.
2. Gửi/duyệt KYC.
3. Tạo campaign với tỉnh và phường hợp lệ.
4. Duyệt campaign, kiểm tra địa điểm bị khóa.
5. Tạo donation và nhận webhook thanh toán.
6. Gửi và xác nhận yêu cầu giải ngân.
7. Mở PDF bảng chi tiết giao dịch.
8. Đăng bài cộng đồng có media.
9. Upload, xem, like và comment video.
10. Gửi tin nhắn realtime.
11. Hỏi chatbot theo địa điểm và tiến độ trên desktop/mobile.


### Chúng em đã biết làm web và hiểu hệ thống web hoạt động như thế nào.