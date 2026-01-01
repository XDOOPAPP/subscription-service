# Subscription Service

Dịch vụ quản lý subscription và plans cho hệ thống microservices, hỗ trợ đăng ký, hủy, auto-renewal và quản lý features.

## 📋 Tính Năng

- ✅ Quản lý subscription plans (MONTHLY, YEARLY, LIFETIME)
- ✅ Đăng ký subscription
- ✅ Hủy subscription
- ✅ Auto-renewal toggle
- ✅ Kiểm tra features theo subscription
- ✅ Lịch sử subscription
- ✅ Quản lý plans (CRUD) - Admin
- ✅ Thống kê subscriptions - Admin
- ✅ Kích hoạt subscription sau payment
- ✅ Lấy danh sách features của user

## 🏗️ Kiến Trúc

Dự án sử dụng **Repository Pattern** và **Service Layer**:

```
subscription-service/
├── index.js                          # Entry point
├── package.json
└── src/
    ├── app.js                        # Express app setup
    ├── config/
    │   ├── database.js              # MongoDB connection
    │   └── env.js                   # Environment config
    ├── constants/
    │   └── subscription-status.js   # Status constants
    ├── controllers/
    │   └── subscription.controller.js # Request handlers
    ├── middlewares/
    │   ├── auth.middleware.js       # JWT verification
    │   └── errorHandler.middleware.js # Error handler
    ├── models/
    │   ├── plan.model.js            # Plan schema
    │   └── subscription.model.js    # Subscription schema
    ├── repositories/
    │   ├── plan.repository.js      # Plan DB operations
    │   └── subscription.repository.js # Subscription DB operations
    ├── routes/
    │   └── subscription.route.js    # Route definitions
    ├── services/
    │   └── subscription.service.js   # Business logic
    └── utils/
        ├── appError.js              # Custom error class
        └── asyncHandler.js          # Async error wrapper
```

## 🚀 Quick Start

### Local Development

```bash
# Cài đặt dependencies
npm install

# Tạo file .env
PORT=3005
MONGO_URL=mongodb://localhost:27017/subscription_db

# Chạy development (với auto-reload)
npm run dev

# Chạy production
npm start
```

### Environment Variables

```env
# Server
PORT=3005

# Database
MONGO_URL=mongodb://admin:password@mongodb:27017/subscription_db?authSource=admin
```

**Lưu ý:** Trong Docker, MongoDB connection string phải dùng service name (`mongodb`), không phải `localhost`.

## 📡 API Endpoints

Base URL: `http://localhost:3005/api/v1/subscriptions`

### Public Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/plans` | Lấy danh sách plans đang active | ❌ |
| `GET` | `/plans/:id` | Lấy chi tiết plan | ❌ |
| `POST` | `/payment/success` | Kích hoạt subscription sau payment | ❌ |

### User Endpoints (Require Auth)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/current` | Lấy subscription hiện tại |
| `POST` | `/` | Đăng ký subscription mới |
| `POST` | `/cancel` | Hủy subscription |
| `GET` | `/history` | Lịch sử subscriptions |
| `GET` | `/check?feature=xxx` | Kiểm tra feature có được phép |
| `GET` | `/features` | Lấy danh sách features của user |
| `POST` | `/auto-renew` | Toggle auto-renewal |

### Admin Endpoints (Require Auth)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/plans` | Tạo plan mới |
| `PATCH` | `/plans/:id` | Cập nhật plan |
| `DELETE` | `/plans/:id` | Disable plan |
| `GET` | `/admin/stats` | Thống kê subscriptions |

## 📝 API Examples

### 1. Lấy Danh Sách Plans

```http
GET /api/v1/subscriptions/plans
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium",
    "price": 29.99,
    "interval": "MONTHLY",
    "features": ["feature1", "feature2", "feature3"],
    "isFree": false,
    "isActive": true
  }
]
```

### 2. Đăng Ký Subscription

```http
POST /api/v1/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "507f1f77bcf86cd799439011"
}
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "user_123",
  "planId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium",
    "price": 29.99,
    "interval": "MONTHLY",
    "features": ["feature1", "feature2"]
  },
  "status": "ACTIVE",
  "startDate": "2025-12-27T00:00:00.000Z",
  "endDate": "2026-01-27T00:00:00.000Z",
  "autoRenew": false
}
```

### 3. Lấy Subscription Hiện Tại

```http
GET /api/v1/subscriptions/current
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "userId": "user_123",
  "planId": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium",
    "features": ["feature1", "feature2"]
  },
  "status": "ACTIVE",
  "startDate": "2025-12-27T00:00:00.000Z",
  "endDate": "2026-01-27T00:00:00.000Z"
}
```

### 4. Kiểm Tra Feature

```http
GET /api/v1/subscriptions/check?feature=feature1
Authorization: Bearer <token>
```

**Response:**
```json
{
  "allowed": true
}
```

### 5. Hủy Subscription

```http
POST /api/v1/subscriptions/cancel
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Subscription cancelled"
}
```

### 6. Toggle Auto-Renewal

```http
POST /api/v1/subscriptions/auto-renew
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "autoRenew": true
}
```

### 7. Kích Hoạt Sau Payment

```http
POST /api/v1/subscriptions/payment/success
Content-Type: application/json

{
  "userId": "user_123",
  "planId": "507f1f77bcf86cd799439011",
  "paymentRef": "PAYMENT_REF_001"
}
```

**Response:**
```json
{
  "success": true
}
```

### 8. Tạo Plan (Admin)

```http
POST /api/v1/subscriptions/plans
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Premium",
  "price": 29.99,
  "interval": "MONTHLY",
  "features": ["feature1", "feature2", "feature3"],
  "isFree": false,
  "isActive": true
}
```

## 📊 Database Models

### Plan

```javascript
{
  name: String,
  price: Number,
  interval: String (enum: ["MONTHLY", "YEARLY", "LIFETIME"]),
  features: [String],
  isFree: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscription

```javascript
{
  userId: String (required),
  planId: ObjectId (ref: Plan, required),
  status: String (enum: ["ACTIVE", "CANCELLED", "EXPIRED", "PENDING"]),
  startDate: Date,
  endDate: Date (null for LIFETIME),
  cancelledAt: Date,
  paymentRef: String,
  autoRenew: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ userId: 1, status: 1 }` - Tối ưu query active subscription

## 🔄 Business Logic

### Subscription Flow

1. **Đăng ký:**
   - User chọn plan → Tạo subscription với status ACTIVE
   - Tính endDate dựa trên interval (MONTHLY: +1 month, YEARLY: +1 year, LIFETIME: null)
   - Một user chỉ có thể có 1 subscription ACTIVE

2. **Hủy:**
   - Đổi status từ ACTIVE → EXPIRED
   - Lưu cancelledAt timestamp

3. **Auto-Renewal:**
   - User có thể toggle autoRenew
   - (Cần job để tự động renew khi endDate đến)

4. **Feature Check:**
   - Kiểm tra user có subscription ACTIVE
   - Kiểm tra plan có chứa feature cần check

### Plan Intervals

- **MONTHLY:** EndDate = StartDate + 1 month
- **YEARLY:** EndDate = StartDate + 1 year
- **LIFETIME:** EndDate = null (không bao giờ hết hạn)

## 🔐 Authentication

Service sử dụng JWT token từ Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**Lưu ý:** Auth middleware hiện tại cần được cải thiện để verify token thực sự (hiện tại chỉ có try-catch rỗng).

## 🚨 Error Handling

Tất cả errors được xử lý bởi global error handler:

```json
{
  "message": "Error description"
}
```

**Common Errors:**
- `400` - `planId is required` - Thiếu planId
- `404` - `Plan not found or inactive` - Plan không tồn tại hoặc inactive
- `404` - `No active subscription to cancel` - Không có subscription để hủy
- `409` - `User already has an active subscription` - User đã có subscription active
- `401` - `Invalid token` - Token không hợp lệ

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **amqplib** - RabbitMQ client (chưa sử dụng)

## 🔧 Development

```bash
# Install dependencies
npm install

# Run with auto-reload
npm run dev

# Run production
npm start
```

## ⚠️ Cần Cải Thiện

### 1. Authentication Middleware
- Hiện tại auth middleware không verify token thực sự
- Cần tích hợp với auth-service để verify JWT

### 2. Validation
- Thiếu input validation (có thể dùng express-validator)
- Cần validate planId format, userId format

### 3. Auto-Renewal Job
- Cần cron job để tự động renew subscriptions khi endDate đến
- Cần job để expire subscriptions đã hết hạn

### 4. Error Handling
- Cần chi tiết hơn (status code, error codes)
- Cần logging errors

### 5. Testing
- Thiếu unit tests
- Thiếu integration tests

### 6. Docker Setup
- Chưa có Dockerfile
- Chưa có docker-compose.yml

### 7. Documentation
- Cần Swagger/OpenAPI documentation
- Cần API examples chi tiết hơn

### 8. Security
- Cần rate limiting
- Cần input sanitization
- Cần role-based access control (Admin endpoints)

## 📄 License

ISC

