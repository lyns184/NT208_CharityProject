# ThienNguyen — Nền tảng gây quỹ từ thiện

Frontend cho hệ thống gây quỹ từ thiện **ThienNguyen**, xây dựng bằng React + Vite.

## Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| Tailwind CSS | 4 | Styling |
| shadcn/ui + Radix UI | — | Component library |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.x | HTTP client |
| Sonner | 2 | Toast notifications |
| Lucide React | — | Icon library |

## Cài đặt & Chạy

```bash
# Cài dependencies
npm install

# Chạy development server (mặc định: http://localhost:5173)
npm run dev

# Build production
npm run build

# Preview bản build
npm run preview
```

## Cấu hình Backend

Dev proxy được cấu hình trong `vite.config.js`. Mọi request `/api/*` sẽ được proxy đến backend:

```js
// vite.config.js → server.proxy
"/api": {
  target: "http://localhost:5000",  // Đổi URL backend tại đây
  changeOrigin: true,
  secure: false,
}
```

## Cấu trúc thư mục

```
src/
├── api/                  # Các hàm gọi API (axios)
│   ├── auth.api.js       # Đăng nhập, đăng ký, logout, refresh token
│   ├── campaign.api.js   # CRUD chiến dịch, donations
│   ├── payment.api.js    # Tạo payment, check trạng thái
│   ├── disbursement.api.js # Yêu cầu giải ngân
│   ├── user.api.js       # Profile, KYC, lịch sử đóng góp
│   ├── upload.api.js     # Upload ảnh lên Cloudinary
│   ├── admin.api.js      # Duyệt KYC, campaign, giải ngân
│   └── verify.api.js     # Xác minh blockchain
│
├── components/
│   ├── admin/            # AdminStatsCards, KYCReviewCard, CampaignApprovalCard, DisbursementManageCard
│   ├── campaign/         # CampaignCard, CampaignForm, CampaignSummaryAI, RelatedCampaigns
│   ├── disbursement/     # DisbursementRequestForm, PublicProofGallery
│   ├── donation/         # DonateForm, DonationCard, DonationList, QRModal
│   ├── kyc/              # KYCUploadForm, KYCStatusBanner
│   ├── layout/           # Navbar, Sidebar, Footer
│   ├── shared/           # ProgressBar, StatusBadge, BlockchainLink, ImageUpload, LoadingSkeleton
│   └── ui/               # shadcn/ui components (Button, Card, Dialog, ...)
│
├── constants/
│   ├── api-endpoints.js  # Tất cả API endpoints
│   ├── enums.js          # Status enums (Campaign, KYC, Payment, ...)
│   └── routes.js         # Route paths
│
├── contexts/
│   ├── AuthContext.jsx   # Quản lý auth state + localStorage persist
│   └── ThemeContext.jsx  # Dark/light mode
│
├── hooks/
│   ├── useAuth.js        # Hook truy cập auth context
│   ├── useCampaigns.js   # Fetch & filter campaigns
│   ├── useDebounce.js    # Debounce input
│   ├── usePagination.js  # Phân trang
│   ├── usePolling.js     # Polling API (dùng cho QR payment)
│   └── useTheme.js       # Hook truy cập theme context
│
├── pages/
│   ├── Home.jsx          # Trang chủ — danh sách chiến dịch
│   ├── CampaignDetail.jsx # Chi tiết chiến dịch + donate + QR
│   ├── CreateCampaign.jsx # Tạo chiến dịch (cần KYC approved)
│   ├── MyCampaigns.jsx   # Chiến dịch của tôi
│   ├── DisbursementRequest.jsx # Yêu cầu giải ngân
│   ├── Profile.jsx       # Hồ sơ, đổi mật khẩu, KYC, lịch sử donate
│   ├── Organizers.jsx    # Danh sách tổ chức
│   ├── Login.jsx         # Đăng nhập
│   ├── Register.jsx      # Đăng ký
│   ├── NotFound.jsx      # 404
│   └── admin/
│       ├── Dashboard.jsx           # Thống kê tổng quan
│       ├── KYCManagement.jsx       # Duyệt KYC
│       ├── CampaignApproval.jsx    # Duyệt chiến dịch
│       └── DisbursementManagement.jsx # Quản lý giải ngân
│
├── lib/
│   └── utils.js          # formatVND, formatDate, daysRemaining, cn()
│
├── App.jsx               # Router config
├── main.jsx              # Entry point
└── index.css             # Tailwind imports + theme variables
```

## Routes

| Route | Trang | Quyền |
|---|---|---|
| `/` | Trang chủ | Public |
| `/login` | Đăng nhập | Public |
| `/register` | Đăng ký | Public |
| `/campaigns/:id` | Chi tiết chiến dịch | Public |
| `/campaigns/create` | Tạo chiến dịch | User (KYC Approved) |
| `/organizers` | Danh sách tổ chức | Public |
| `/my-campaigns` | Chiến dịch của tôi | User |
| `/my-campaigns/:id/disburse` | Yêu cầu giải ngân | User |
| `/profile` | Hồ sơ cá nhân | User |
| `/admin/dashboard` | Thống kê | Admin |
| `/admin/kyc` | Duyệt KYC | Admin |
| `/admin/campaigns` | Duyệt chiến dịch | Admin |
| `/admin/disbursements` | Quản lý giải ngân | Admin |

## API Endpoints

Backend base URL: `http://localhost:5000/api/v1`

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/register` | Đăng ký |
| POST | `/auth/logout` | Đăng xuất |
| POST | `/auth/refresh` | Refresh token |

### User
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/user/profile/me` | Lấy profile |
| PUT | `/user/profile/update` | Cập nhật profile |
| PUT | `/user/password` | Đổi mật khẩu |
| POST | `/user/kyc` | Gửi KYC (JSON: idCardFront, idCardBack, portrait) |
| GET | `/user/campaigns` | Chiến dịch của tôi |
| GET | `/user/donations` | Lịch sử đóng góp |
| GET | `/user/organizers` | Danh sách tổ chức |

### Campaign
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/campaigns` | Danh sách chiến dịch |
| POST | `/campaigns` | Tạo chiến dịch |
| GET | `/campaigns/:id` | Chi tiết chiến dịch |
| PUT | `/campaigns/:id/update` | Cập nhật chiến dịch |
| PUT | `/campaigns/:id/close` | Đóng chiến dịch |
| GET | `/campaigns/:id/donations` | Danh sách đóng góp |
| GET | `/campaigns/:id/summary` | Tóm tắt AI |
| GET | `/campaigns/:id/proofs` | Minh chứng giải ngân |

### Payment
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/payment/create` | Tạo giao dịch → nhận QR |
| GET | `/payment/status/:id` | Polling trạng thái thanh toán |

### Disbursement
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/disbursement/request` | Tạo yêu cầu giải ngân |
| POST | `/disbursement/:id/proof` | Upload minh chứng |

### Admin
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/admin/kyc-list` | Danh sách KYC chờ duyệt |
| PUT | `/admin/user/:userId/kyc` | Duyệt/từ chối KYC |
| PUT | `/admin/campaign/:id/approve` | Duyệt/từ chối chiến dịch |
| PUT | `/admin/disbursement/:id/transfer` | Chuyển tiền giải ngân |
| PUT | `/admin/disbursement/:id/verify` | Xác minh giải ngân |

### Upload & Verify
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/upload` | Upload ảnh → Cloudinary URL |
| GET | `/verify/donation/:id` | Xác minh donation trên blockchain |
| GET | `/verify/disbursement/:id` | Xác minh giải ngân trên blockchain |

## Luồng chính

### Đóng góp (Donation)
1. User chọn số tiền → bấm "Đóng góp ngay"
2. FE gọi `POST /payment/create` → nhận `{ qrCodeUrl, transferContent }`
3. Hiện QR modal + nội dung chuyển khoản
4. Polling `GET /payment/status/:id` mỗi 3s (timeout 5 phút)
5. Khi `status === SUCCESS` → hiện thông báo thành công, refetch campaign + donations

### KYC
1. User upload 3 ảnh (CMND trước, sau, chân dung) → Cloudinary trả URL
2. Gửi `POST /user/kyc` với JSON `{ idCardFront, idCardBack, portrait }`
3. Admin duyệt → user có thể tạo chiến dịch

### Tạo chiến dịch
1. User điền form (tiêu đề, mô tả, mục tiêu, ngày kết thúc, ảnh)
2. Upload ảnh → nhận URL string
3. Gửi `POST /campaigns` → chiến dịch ở trạng thái PENDING
4. Admin duyệt → ACTIVE

### Giải ngân
1. Chủ chiến dịch tạo yêu cầu `POST /disbursement/request`
2. Admin chuyển tiền + nhập txHash → `PUT /admin/disbursement/:id/transfer`
3. Admin xác minh → `PUT /admin/disbursement/:id/verify`


