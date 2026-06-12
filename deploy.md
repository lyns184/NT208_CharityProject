# Hướng dẫn deploy OpenHeart lên VPS

Tài liệu này hướng dẫn deploy dự án OpenHeart lên VPS Ubuntu để chạy public với domain thật, HTTPS, Nginx, PM2, MongoDB, Cloudinary và Socket.IO.

## 1. Kiến trúc deploy khuyến nghị

Mô hình chạy ổn định nhất cho project này:

- Frontend: build bằng Vite và serve qua Nginx
- Backend: chạy Node.js / Express bằng PM2
- API: reverse proxy qua Nginx tại `/api`
- Socket.IO: reverse proxy qua Nginx tại `/socket.io`
- Database: MongoDB Atlas hoặc MongoDB cài trên VPS
- Upload media: Cloudinary
- SSL: Let’s Encrypt / Certbot

Luồng truy cập:

- `https://your-domain.com` -> frontend React
- `https://your-domain.com/api` -> backend Express
- `https://your-domain.com/socket.io` -> Socket.IO

## 2. Các thư mục quan trọng trong repo

- Backend API: `BACKEND-CHARITY-main/backend/api`
- Frontend: `fe`
- Smart contract: `BACKEND-CHARITY-main/contracts`

Các file quan trọng:

- Backend entry: `BACKEND-CHARITY-main/backend/api/server.js`
- Backend upload route: `BACKEND-CHARITY-main/backend/api/src/modules/upload/upload.routes.js`
- Frontend socket client: `fe/src/lib/socket.js`
- Frontend API config: `fe/src/constants/api-endpoints.js`
- Frontend Vite config: `fe/vite.config.js`

## 3. Yêu cầu trước khi deploy

Cần có:

- Một VPS Ubuntu 22.04 hoặc 24.04
- Một domain đã trỏ DNS về VPS
- MongoDB connection string
- Cloudinary account
- Node.js LTS
- Nginx
- PM2

Nếu dùng blockchain:

- `RPC_URL`
- `PRIVATE_KEY`
- `CONTRACT_ADDRESS`

## 4. Cài môi trường trên VPS

Cập nhật hệ thống:

```bash
sudo apt update && sudo apt upgrade -y
```

Cài gói cần thiết:

```bash
sudo apt install -y git curl nginx build-essential
```

Cài Node.js 20 LTS và npm:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Cài PM2:

```bash
sudo npm install -g pm2
```

Kiểm tra:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

## 5. Clone source code lên VPS

Ví dụ đặt source tại `/var/www`:

```bash
cd /var/www
sudo git clone <YOUR_REPO_URL> WebThienNguyen
sudo chown -R $USER:$USER /var/www/WebThienNguyen
cd /var/www/WebThienNguyen
```

## 6. Cấu hình backend

Backend chính nằm ở `BACKEND-CHARITY-main/backend/api`.

### 6.1. Tạo file môi trường

Trong thư mục backend API:

```bash
cd /var/www/WebThienNguyen/BACKEND-CHARITY-main/backend/api
cp .env.example .env
```

Nếu bạn không có sẵn `.env.example`, có thể tạo `.env` thủ công.

### 6.2. Các biến môi trường cần có

Mẫu tối thiểu:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/openheart
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_ORIGIN=https://your-domain.com
```

Nếu dùng blockchain:

```env
RPC_URL=https://your-rpc-provider
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
```

Nếu dùng payment / webhook:

```env
SEPAY_WEBHOOK_SECRET=your_webhook_secret
SEPAY_BANK_CODE=MB
SEPAY_ACCOUNT_NO=0123456789
SEPAY_ACCOUNT_NAME=OpenHeart
```

### 6.3. Cài dependency backend

```bash
cd /var/www/WebThienNguyen/BACKEND-CHARITY-main/backend/api
npm install
```

### 6.4. Chạy thử backend

```bash
npm start
```

Hoặc dev:

```bash
npm run dev
```

Backend mặc định chạy ở `http://localhost:5000` nếu `PORT` không đổi.

### 6.5. Chạy backend bằng PM2

Sau khi kiểm tra chạy ổn, dùng PM2 để giữ process sống:

```bash
pm2 start server.js --name openheart-api
pm2 save
pm2 startup
```

Sau khi chạy `pm2 startup`, terminal sẽ in ra một lệnh bổ sung. Bạn copy lệnh đó và chạy để PM2 tự khởi động sau reboot.

Kiểm tra:

```bash
pm2 status
pm2 logs openheart-api
```

## 7. Cấu hình frontend

Frontend nằm ở `fe`.

### 7.1. Cài dependency

```bash
cd /var/www/WebThienNguyen/fe
npm install
```

### 7.2. Cấu hình biến môi trường frontend

Frontend hiện đang dùng `import.meta.env.VITE_SOCKET_URL` trong `fe/src/lib/socket.js` và `import.meta.env.VITE_ETHERSCAN_BASE_URL` trong `fe/src/lib/utils.js`.

Tạo file `.env` trong thư mục `fe`:

```env
VITE_SOCKET_URL=https://your-domain.com
VITE_ETHERSCAN_BASE_URL=https://sepolia.etherscan.io
```

Ghi chú:

- API không cần cấu hình `VITE_API_URL` vì project đang gọi relative path `/api/v1/...`
- Vite sẽ proxy `/api` về backend khi chạy local, còn trên VPS thì Nginx sẽ proxy `/api` và `/socket.io`

### 7.3. Build frontend

```bash
cd /var/www/WebThienNguyen/fe
npm run build
```

Kết quả build nằm trong thư mục `dist`.

## 8. Cấu hình Nginx

Nginx sẽ làm 3 việc:

- Serve frontend tĩnh từ `fe/dist`
- Proxy `/api` về backend Node.js
- Proxy `/socket.io` về backend Socket.IO

### 8.1. Tạo file cấu hình Nginx

```bash
sudo nano /etc/nginx/sites-available/openheart
```

Dán cấu hình mẫu sau:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/WebThienNguyen/fe/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 8.2. Kích hoạt site

```bash
sudo ln -s /etc/nginx/sites-available/openheart /etc/nginx/sites-enabled/openheart
sudo nginx -t
sudo systemctl reload nginx
```

## 9. Bật HTTPS bằng Let’s Encrypt

Cài Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
```

Xin SSL:

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

Certbot sẽ tự sửa cấu hình Nginx và có thể bật redirect HTTP -> HTTPS.

## 10. Deploy lại khi code thay đổi

### Backend

```bash
cd /var/www/WebThienNguyen/BACKEND-CHARITY-main/backend/api
git pull
npm install
pm2 restart openheart-api
```

### Frontend

```bash
cd /var/www/WebThienNguyen/fe
git pull
npm install
npm run build
```

Nếu chỉ đổi giao diện frontend, thường chỉ cần build lại FE.

## 11. Kiểm tra sau deploy

Sau khi deploy xong, kiểm tra các luồng sau:

- Mở `https://your-domain.com`
- Đăng nhập / đăng ký
- Upload avatar
- Tạo chiến dịch mới
- Upload ảnh KYC
- Đăng bài social có hình/video
- Gửi tin nhắn chat realtime
- Tải minh chứng giải ngân
- Kiểm tra link blockchain nếu dùng contract

## 12. Lưu ý đặc biệt với project này

- FE gọi API bằng đường dẫn relative `/api/v1/...`, nên Nginx phải proxy `/api` đúng về backend
- Chat realtime phụ thuộc Socket.IO nên phải proxy `/socket.io`
- Upload file dùng Cloudinary, nên backend phải có đủ biến môi trường Cloudinary
- Backend có tích hợp blockchain, nên nếu bật tính năng đó thì phải cấu hình thêm RPC và private key
- Không commit file `.env` thật lên Git

## 13. Troubleshooting nhanh

### 13.1. FE không gọi được API

Kiểm tra:

- Nginx proxy `/api` đã đúng chưa
- Backend đang chạy chưa
- Domain FE có cùng origin không

### 13.2. Chat realtime không kết nối

Kiểm tra:

- `VITE_SOCKET_URL` có đúng domain public không
- Nginx có proxy `/socket.io` không
- Backend PM2 có chạy không

### 13.3. Upload ảnh thất bại

Kiểm tra:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- Giới hạn file upload 50MB

### 13.4. Backend lỗi kết nối DB

Kiểm tra:

- `MONGO_URI`
- Network / firewall / whitelist IP
- MongoDB Atlas đã cho phép IP của VPS chưa

## 14. Lệnh deploy nhanh tóm tắt

```bash
# backend
cd /var/www/WebThienNguyen/BACKEND-CHARITY-main/backend/api
cp .env.example .env
npm install
pm2 start server.js --name openheart-api
pm2 save
pm2 startup

# frontend
cd /var/www/WebThienNguyen/fe
npm install
npm run build

# nginx
sudo ln -s /etc/nginx/sites-available/openheart /etc/nginx/sites-enabled/openheart
sudo nginx -t
sudo systemctl reload nginx

# ssl
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 15. Kết luận

Nếu cấu hình đúng các phần sau:

- Backend `.env`
- Frontend `.env`
- PM2
- Nginx proxy
- SSL
- Cloudinary / MongoDB / Socket.IO

thì dự án sẽ chạy public ổn định trên VPS.
