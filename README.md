# Subscription Service

Dịch vụ quản lý các gói đăng ký (Subscription Plans) cho hệ thống, hỗ trợ đăng ký, gia hạn tự động, nâng cấp/hạ cấp gói, và kiểm tra quyền hạn dựa trên gói dịch vụ.

## 📋 Tính Năng

### Subscription Management
- ✅ **Đăng ký gói mới** (Monthly, Yearly, Lifetime)
- ✅ **Hủy đăng ký** (Auto-expire khi hết hạn)
- ✅ **Gia hạn tự động** (Auto-renewal toggle)
- ✅ **Nâng cấp/Hạ cấp gói** (Change plan)
- ✅ **Lịch sử đăng ký** (Subscription history)

### Plan Management (Admin)
- ✅ **CRUD Plans** (Tạo, sửa, xóa, ẩn/hiện gói)
- ✅ **Quản lý features** cho từng gói

### Integration
- ✅ **Check Features** (Kiểm tra user có quyền sử dụng tính năng không)
- ✅ **Payment Integration** (Kích hoạt gói sau khi thanh toán thành công)
- ✅ **Gateway Auth** (Tin tưởng xác thực từ Gateway)
- ✅ **RabbitMQ Integration** (Event-driven architecture)

## 🏗️ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                   Subscription Service                       │
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Controllers  │───▶│  Services    │───▶│ Repositories │  │
│  │              │    │              │    │              │  │
│  │ - sub        │    │ - Business   │    │ - Database   │  │
│  │ - plan       │    │   Logic      │    │   Queries    │  │
│  │ - admin      │    │ - EventBus   │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                      │        │
│         │                    ▼                      ▼        │
│         │            ┌──────────────┐    ┌──────────────┐  │
│         │            │   RabbitMQ   │    │   MongoDB    │  │
│         │            └──────────────┘    │  (Database)  │  │
│         │                                └──────────────┘  │
│         ▼                                                   │
│  ┌──────────────┐                                           │
│  │  Middleware  │                                           │
│  │ - Auth       │                                           │
│  └──────────────┘                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 7.0+
- RabbitMQ 3.12+

### Local Development

```bash
# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cấu hình .env (xem phần Environment Variables)
# Chỉnh sửa file .env với thông tin của bạn

# Chạy development (với auto-reload)
npm run dev

# Chạy production
npm start
```

## ⚙️ Environment Variables

Tạo file `.env` trong root folder:

```env
# Server Configuration
PORT=3005

# Database
MONGO_URL=mongodb://localhost:27017/subscription_db

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
```

### Giải Thích Biến Môi Trường

| Biến | Mô Tả | Ví Dụ |
|------|-------|-------|
| `PORT` | Port mà service chạy | `3005` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/subscription_db` |
| `RABBITMQ_URL` | RabbitMQ connection string | `amqp://localhost:5672` |

## 📡 API Endpoints

Base URL: `http://localhost:3005/api/v1/subscriptions`

### Public Endpoints

| Method | Endpoint | Mô Tả | Query Params |
|--------|----------|-------|--------------|
| `GET` | `/plans` | Lấy danh sách gói đang hoạt động | - |
| `GET` | `/plans/:id` | Lấy chi tiết gói | Param: `id` |
| `POST` | `/payment/success` | Callback kích hoạt gói (Internal) | Body: `userId`, `planId`, `paymentRef` |

### Protected Endpoints (Requires `x-user-id`)

| Method | Endpoint | Mô Tả | Body/Params |
|--------|----------|-------|-------------|
| `GET` | `/current` | Lấy gói hiện tại của user | - |
| `POST` | `/` | Đăng ký gói mới | `planId` |
| `POST` | `/cancel` | Hủy gói hiện tại | - |
| `POST` | `/auto-renew` | Bật/tắt tự động gia hạn | - |
| `GET` | `/history` | Xem lịch sử đăng ký | - |
| `GET` | `/check` | Kiểm tra quyền (Features) | Query: `feature=xxx` |

### Admin Endpoints

| Method | Endpoint | Mô Tả | Auth |
|--------|----------|-------|------|
| `POST` | `/plans` | Tạo gói mới | Admin Only |
| `PATCH` | `/plans/:id` | Cập nhật gói | Admin Only |
| `GET` | `/admin/stats` | Thống kê | Admin Only |

## 📝 API Usage Examples

### 1. Register Subscription

```http
POST /api/v1/subscriptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "planId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response:**
```json
{
  "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
  "userId": "user_123",
  "planId": {
    "name": "Pro Plan",
    "price": 200000
  },
  "status": "ACTIVE",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-01T00:00:00.000Z"
}
```

### 2. Check Feature Access

```http
GET /api/v1/subscriptions/check?feature=unlimited_projects
Authorization: Bearer <token>
```

**Response (Allowed):**
```json
{
  "allowed": true
}
```

## 📊 Database Models

### Subscription Model

```javascript
{
  userId: String,              // ID của user (từ Auth Service)
  planId: ObjectId,            // Reference tới Plan
  status: String,              // ACTIVE, EXPIRED, CANCELLED, PENDING
  startDate: Date,
  endDate: Date,               // Null nếu là Lifetime
  autoRenew: Boolean,          // Mặc định false
  paymentRef: String,          // Reference tới Payment Service
  createdAt: Date
}
```

### Plan Model

```javascript
{
  name: String,                // Tên gói (e.g., Basic, Pro)
  price: Number,               // Giá tiền
  interval: String,            // MONTHLY, YEARLY, LIFETIME
  features: [String],          // Danh sách features
  isActive: Boolean,           // Cho phép đăng ký mới hay không
  isFree: Boolean
}
```

## 🔄 Event-Driven Architecture

### 1. Published Events

Service publish các sự kiện thay đổi Plan để các service khác (ví dụ: Payment Service) cập nhật cache:

**Event:** `PLAN_CREATED`, `PLAN_UPDATED`
**Exchange:** `domain_events`
**Payload:**
```json
{
  "planId": "65123...",
  "name": "Pro Plan",
  "price": 200000,
  "interval": "MONTHLY",
  "isActive": true,
  "isFree": false
}
```

### 2. Consumed Events

Service lắng nghe các sự kiện để tự động xử lý logic nghiệp vụ:

| Event | Source | Hành Động |
|-------|--------|-----------|
| `USER_CREATED` | Auth Service | Tự động đăng ký gói **FREE** cho user mới tạo |
| `PAYMENT_SUCCESS` | Payment Service | Kích hoạt (`ACTIVE`) subscription đang ở trạng thái `PENDING` |

## 📦 Dependencies

| Package | Version | Mô Tả |
|---------|---------|-------|
| `express` | ^5.2.1 | Web framework |
| `mongoose` | ^9.1.1 | MongoDB ODM |
| `jsonwebtoken` | ^9.0.3 | Token decoding |
| `amqplib` | ^0.10.3 | RabbitMQ client |

## 📄 License

ISC
