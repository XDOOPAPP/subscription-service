# 📦 Subscription Service

Microservice quản lý gói đăng ký (Subscription), kế hoạch (Plans), và quyền truy cập tính năng cho người dùng.

## ✨ Tính Năng

- **Quản Lý Gói (Plans)**:
    - Tạo, cập nhật, vô hiệu hóa các gói dịch vụ (Monthly, Yearly, Lifetime).
    - Tùy chỉnh giá, tính năng, và trạng thái.
- **Quản Lý Subscription**:
    - Đăng ký gói mới.
    - Hủy gói hiện tại.
    - Tự động kích hoạt Free Plan cho user mới.
    - Kiểm tra tính năng (Feature Gating).
- **Tự Động Hóa**:
    - Cron job kiểm tra và xử lý subscription hết hạn (chạy mỗi 5 phút).
    - Tự động cập nhật trạng thái khi thanh toán thành công.
- **Event-Driven**:
    - Tích hợp RabbitMQ để giao tiếp với các service khác (`auth-service`, `payment-service`).
    - Lắng nghe sự kiện: `USER_CREATED`, `PAYMENT_SUCCESS`.
    - Phát sự kiện: `PLAN_CREATED`, `PLAN_UPDATED`, `SUBSCRIPTION_EXPIRED`.

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Message Queue**: RabbitMQ (amqplib)
- **Security**: JWT (Decode), Internal Header Authentication (`x-user-id`)

## 🚀 Cài Đặt & Chạy

### 1. Prerequisites

- Node.js (v18+)
- MongoDB
- RabbitMQ

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Environment

Tạo file `.env` từ `.env.example`:

```env
PORT=3005
MONGO_URL=mongodb://localhost:27017/subscription_db
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

### 4. Chạy Service

- **Development**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

---

## 📡 API Endpoints

Service chạy mặc định tại `http://localhost:3005`.

### Public

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/v1/subscriptions/plans` | Lấy danh sách các gói đang hoạt động |
| `GET` | `/api/v1/subscriptions/plans/:id` | Xem chi tiết một gói |
| `GET` | `/api/v1/subscriptions/health` | Kiểm tra trạng thái service |

### User (Yêu cầu Authentication)

> **Lưu ý**: Các request cần header `x-user-id` (từ Gateway)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `GET` | `/api/v1/subscriptions/current` | Lấy thông tin subscription hiện tại |
| `POST` | `/api/v1/subscriptions` | Đăng ký gói mới (Body: `{ "planId": "..." }`) |
| `POST` | `/api/v1/subscriptions/cancel` | Hủy subscription hiện tại |
| `GET` | `/api/v1/subscriptions/history` | Xem lịch sử đăng ký |
| `GET` | `/api/v1/subscriptions/features` | Lấy danh sách tính năng được phép dùng |
| `GET` | `/api/v1/subscriptions/check?feature=NAME` | Kiểm tra quyền truy cập một tính năng cụ thể |

### Admin (Quản Lý Gói)

| Method | Endpoint | Mô tả |
| :--- | :--- | :--- |
| `POST` | `/api/v1/subscriptions/plans` | Tạo gói mới |
| `PATCH` | `/api/v1/subscriptions/plans/:id` | Cập nhật gói |
| `DELETE` | `/api/v1/subscriptions/plans/:id` | Vô hiệu hóa gói |
| `GET` | `/api/v1/subscriptions/admin/stats` | Xem thống kê subscription |

## 📝 API Usage Examples

Bạn có thể test trực tiếp bằng Postman hoặc Thunder Client.

> **Lưu ý quan trọng**: Khi test trực tiếp service này (`localhost:3005`), bạn **BẮT BUỘC** phải giả lập header `x-user-id` (giả lập việc request đã đi qua Gateway).

### 1. Create Plan Flow (Admin)

#### Step 1: Create a new Plan
```http
POST /api/v1/subscriptions/plans
Content-Type: application/json
x-user-id: admin-id-123

{
  "name": "Premium Plan",
  "price": 99000,
  "interval": "MONTHLY",
  "features": ["no-ads", "4k-streaming"],
  "isActive": true
}
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5... (plan_id)",
  "name": "Premium Plan",
  "price": 99000,
  "interval": "MONTHLY",
  "features": ["no-ads", "4k-streaming"],
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Step 2: Get All Plans
```http
GET /api/v1/subscriptions/plans
```

**Response:**
```json
[
  {
    "_id": "65a1b2c3d4e5... (plan_id)",
    "name": "Premium Plan",
    "price": 99000,
    "isActive": true
  }
]
```

### 2. User Subscription Flow

#### Step 1: Subscribe to a Plan
Lấy `_id` từ kết quả tạo gói (User Flow) để đăng ký.

```http
POST /api/v1/subscriptions
Content-Type: application/json
x-user-id: user-id-123

{
  "planId": "65a1b2c3d4e5..."
}
```

**Response:**
```json
{
  "_id": "65b2c3d4e5f6... (sub_id)",
  "userId": "user-id-123",
  "planId": "65a1b2c3d4e5...",
  "status": "PENDING",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-02-01T00:00:00.000Z"
}
```

#### Step 2: Check Current Subscription
```http
GET /api/v1/subscriptions/current
x-user-id: user-id-123
```

**Response:**
```json
{
  "_id": "65b2c3d4e5f6...",
  "status": "PENDING",
  "planId": {
    "name": "Premium Plan",
    "price": 99000
  }
}
```

#### Step 3: Check Feature Access
Kiểm tra xem user có quyền dùng tính năng nào đó không (dựa trên gói đã đăng ký).

```http
GET /api/v1/subscriptions/check?feature=no-ads
x-user-id: user-id-123
```

**Response:**
```json
{
  "allowed": true
}
```

### 3. Management Flow

#### Cancel Subscription
```http
POST /api/v1/subscriptions/cancel
x-user-id: user-id-123
```

**Response:**
```json
{
  "message": "Subscription cancelled"
}
```

#### View History
```http
GET /api/v1/subscriptions/history
x-user-id: user-id-123
```

**Response:**
```json
[
  {
    "_id": "65b2c3d4e5f6...",
    "status": "CANCELLED",
    "planId": "65a1b2c3d4e5...",
    "startDate": "..."
  }
]
```

## 🏗️ Cấu Trúc Project

```
src/
├── config/         # Cấu hình DB, Env
├── constants/      # Các hằng số (Status enum)
├── controllers/    # Xử lý request HTTP
├── infra/          # Event Bus (RabbitMQ)
├── middlewares/    # Auth, Error Handler
├── models/         # Mongoose Schemas (Plan, Subscription)
├── repositories/   # Data Access Layer
├── routes/         # Định nghĩa API routes
├── services/       # Business Logic
└── utils/          # Helper functions (AsyncHandler, AppError)
```
