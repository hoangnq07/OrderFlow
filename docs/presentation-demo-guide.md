# OrderFlow — 15-20 Minute Live Demo & Presentation Script

## 1. Presentation Structure (15–20 Minutes)

```mermaid
timeline
    title Live Demo Roadmap (20 Minutes)
    00:00 - 03:00 : System Overview & Architecture Overview
                  : Tech stack (Spring Boot, Redis, RabbitMQ, PostgreSQL, Angular 17)
    03:00 - 08:00 : Customer Flow Demo
                  : Register/Login -> FTS Search -> Redis Cart -> Checkout -> MailHog Email
    08:00 - 12:00 : Admin Operations Flow
                  : Product Form -> Order Management -> Analytics Dashboard
    12:00 - 16:00 : Technical Deep-Dive
                  : Pessimistic Stock Locking -> Apache Bench SLA (<20ms) -> RabbitMQ Retry/DLQ
    16:00 - 20:00 : Q&A Session
                  : Evaluator Q&A and Architecture Invariant Verification
```

---

## 2. Step-by-Step Live Demo Script

### Phase 1: Customer Journey (Luồng người dùng)
1. **Đăng ký & Đăng nhập**:
   - Mở ứng dụng Angular tại `http://localhost:4200/auth/login`.
   - Thực hiện Đăng ký tài khoản người dùng mới và Đăng nhập thu được JWT Token.
2. **Tìm kiếm & Xem sản phẩm**:
   - Tìm kiếm sản phẩm bằng tính năng Full-Text Search.
   - Nhấp vào sản phẩm chi tiết (được cache 30 phút trên Redis).
3. **Giỏ hàng Redis (Shopping Cart)**:
   - Thêm sản phẩm vào giỏ hàng.
   - Thay đổi số lượng, kiểm tra giỏ hàng lưu trữ dưới dạng Hash `cart:{userId}` trên Redis.
4. **Tạo đơn hàng & Khóa kho**:
   - Tiến hành Đặt hàng (Checkout). Hệ thống kích hoạt `@Transactional` khóa kho bi quan `PESSIMISTIC_WRITE` xếp theo ID tăng dần.
   - Giỏ hàng tự động evicted khỏi Redis sau khi giao dịch DB hoàn tất.
5. **Xử lý bất đồng bộ & Email**:
   - `OrderCreatedEvent` bắn sang RabbitMQ `payment.process.queue` $\rightarrow$ Giả lập thanh toán $\rightarrow$ `PaymentCompletedEvent` $\rightarrow$ `notification.email.queue`.
   - Mở MailHog Web UI (`http://localhost:8025`) kiểm tra email xác nhận đơn hàng nhận được tức thì.

### Phase 2: Admin Operations (Luồng quản trị)
1. **Đăng nhập quyền Admin**:
   - Đăng nhập tài khoản Admin (`admin@example.com`).
2. **Quản lý đơn hàng**:
   - Mở trang Admin Orders (`http://localhost:4200/admin/orders`). Lọc đơn hàng theo trạng thái `PENDING`.
   - Đổi trạng thái đơn hàng `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `PROCESSING` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`.
3. **Dashboard Analytics**:
   - Mở Dashboard (`http://localhost:4200/dashboard`) xem các card thống kê: Tổng đơn hàng, Đơn chờ xử lý, Tổng doanh thu hệ thống.

---

## 3. Highlighting Technical Solvers

1. **Chống overselling**:
   - Giải thích cơ chế sort Product ID trước khi khóa bi quan `PESSIMISTIC_WRITE` để triệt tiêu nguy cơ Deadlock.
2. **Hiệu năng hệ thống (Apache Bench Benchmark)**:
   - Trình bày kết quả test `ab -n 1000 -c 50`: Thời gian phản hồi trung bình **< 20ms**, Tỷ lệ lỗi **0%**.
