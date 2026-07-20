---
title: "PRD - OrderFlow E-Commerce System"
status: final
created: "2026-07-20"
updated: "2026-07-20"
topic: "OrderFlow"
---

# Product Requirement Document (PRD): OrderFlow System

## 1. Executive Summary & Vision

**OrderFlow** là hệ thống E-Commerce full-stack (Prefix: **OFL**) thuộc dự án **Training Project Team 1** (HoangNQ17 + DuanDH3). Hệ thống xử lý đơn hàng từ lúc khởi tạo đến khi hoàn tất giao hàng:
- Quản lý danh mục sản phẩm (Product Catalog Management).
- Giỏ hàng lưu trữ trên Redis (`cart:{userId}`, TTL 7 ngày).
- Đặt hàng sử dụng khóa bi quan (Pessimistic Lock `PESSIMISTIC_WRITE`), **sắp xếp ID sản phẩm trước khi khóa để chống deadlock**.
- Xử lý thanh toán giả lập (Mock payment processing).
- Gửi email thông báo đơn hàng bất đồng bộ qua RabbitMQ và MailHog UI (`http://localhost:8025`).

---

## 2. Technical Architecture & Stack

- **Backend**: Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, PostgreSQL 16, Redis 7, RabbitMQ 3, Flyway, MapStruct, Lombok, SpringDoc OpenAPI.
- **Frontend**: Angular 17, Angular Material, RxJS, TypeScript.
- **Infrastructure**: Docker Compose (PostgreSQL 16, Redis 7, RabbitMQ 3, MailHog).
- **Database Schema**:
  - `categories` (id, name, slug, created_at)
  - `products` (id, name, slug, description, price, stock, category_id, image_url, active, version, search_vector TSVECTOR, created_at, updated_at)
  - `orders` (id, user_id, status, total_amount, shipping_address, note, created_at, updated_at)
  - `order_items` (id, order_id, product_id, product_name, quantity, unit_price, subtotal)
  - Indexes: `idx_products_category`, `idx_products_active`, `idx_products_search` (GIN), `idx_orders_user`, `idx_orders_status`, `idx_orders_user_status`, `idx_order_items_order`.
- **Order Status Flow**:
  `PENDING` ➔ `CONFIRMED` ➔ `PROCESSING` ➔ `SHIPPED` ➔ `DELIVERED` (hoặc `CANCELLED` từ `PENDING`/`CONFIRMED`).

---

## 3. Epics & Functional Requirements (FRs)

### Epic 1: Catalog & Product Management
- **FR-1.1 Category & Product Data Model**: Entities Category & Product, Flyway migration V2. [REQ-OFL-B-101, B-102]
- **FR-1.2 Category & Product Services**: CRUD service với MapStruct & soft delete (`active=false`). [REQ-OFL-B-103, B-104]
- **FR-1.3 Product Catalog API**: `GET /api/v1/products` (paginated `PageResponse<ProductResponse>`), REST CRUD endpoints. [REQ-OFL-B-105, B-106]
- **FR-1.4 Category API**: `GET /api/v1/categories`, `POST /api/v1/categories`, Migrations V3 & V4. [REQ-OFL-B-107, B-108]
- **FR-1.5 Angular Catalog Views**: `ProductListComponent` (bảng sản phẩm, phân trang), `ProductFormComponent` (Reactive Forms), Router & Sidebar. [REQ-OFL-F-101 ~ F-104]

### Epic 2: Shopping Cart & Order Placement
- **FR-2.1 Redis Cart Service**: `CartService` lưu trữ trên Redis Hash (`cart:{userId}`, TTL 7 ngày) với `addItem`, `updateQuantity`, `removeItem`, `getCart`, `clearCart`. [REQ-OFL-B-201, B-202]
- **FR-2.2 Transactional Order Creation**: `OrderService.createOrder()` với pessimistic lock (`PESSIMISTIC_WRITE`), **sắp xếp Product IDs trước khi khóa để chống deadlock**, trừ kho, tạo order + items, xóa cart, publish event. [REQ-OFL-B-203, B-204, B-205]
- **FR-2.3 Full-Text Search**: Postgres `tsvector` + GIN index và endpoint `GET /api/v1/products/search?q=`. [REQ-OFL-B-206]
- **FR-2.4 Async Messaging (RabbitMQ)**:
  - `order.exchange` (Topic), `payment.process.queue` (routing `order.created`), `order.notification.queue` (routing `order.#`).
  - `OrderEventPublisher` publish `OrderCreatedEvent`.
  - `PaymentConsumer` xử lý giả lập thanh toán -> publish `PaymentCompletedEvent`.
  - `NotificationConsumer` nhận `PaymentCompletedEvent` -> gửi mail qua MailHog. [REQ-OFL-B-207 ~ B-209]
- **FR-2.5 Product Detail Cache**: Redis cache cho `getById()` (TTL 30 phút), tự động evict khi update/delete. [REQ-OFL-B-210]
- **FR-2.6 Angular Customer Order & Cart UI**: `CartComponent`, `OrderListComponent`, `OrderDetailComponent`, Search Bar. [REQ-OFL-F-201 ~ F-204]

### Epic 3: Caching, Rate Limiting, Admin Operations & Verification
- **FR-3.1 Base Integration Test & Concurrency Test**: `BaseIntegrationTest` với Testcontainers, test đồng thời 10 threads mua hàng (stock=10 -> final stock=0, chống overselling). [REQ-OFL-B-301, B-302]
- **FR-3.2 RabbitMQ Resiliency**: Retry với exponential backoff (3 attempts, 1s initial, 2x multiplier), chuyển DLQ khi lỗi. [REQ-OFL-B-303]
- **FR-3.3 Redis Rate Limiting**: 100 requests/phút/IP (Redis INCR + EXPIRE), trả về HTTP 429 khi vượt quá. [REQ-OFL-B-304]
- **FR-3.4 DB Profiling & Admin Operations**: `EXPLAIN ANALYZE` 3 slow queries, bổ sung index, Admin order endpoints & Angular Admin UI/Dashboard. [REQ-OFL-B-305 ~ B-307, F-301 ~ F-303]

### Epic 4: End-to-End, Bug Fixes, Performance & Delivery
- **FR-4.1 E2E Flow & Bug Triage**: Kiểm thử toàn bộ luồng E2E hệ thống, sửa >= 5 mentor bugs. [REQ-OFL-W-401, W-403]
- **FR-4.2 Cross-Team Review**: Code review Team 2 (ClinicQ) với >= 10 comments. [REQ-OFL-W-402]
- **FR-4.3 Performance Benchmark**: Apache Bench (`ab -n 1000 -c 50`), mục tiêu avg < 200ms, error rate < 1%. [REQ-OFL-W-404]
- **FR-4.4 Delivery**: Cập nhật README hoàn chỉnh, chuẩn bị slide và thực hiện Live Demo 15-20 phút. [REQ-OFL-W-405, W-406]

---

## 4. 20-Story Schedule & Assignment Breakdown (HoangNQ17 & DuanDH3)

### Week 1
- **Day 1**: 
  - HoangNQ17: Entity `Category` & `Product`, Flyway V2, Base CRUD logic (REQ-OFL-B-101 ~ B-104) `[Completed]`.
  - DuanDH3: Git repo, starter codebase exploration, Docker Compose infra checks `[Completed]`.
- **Day 2**:
  - HoangNQ17: `GET /api/v1/products` (paginated) & Product REST endpoints (REQ-OFL-B-105, B-106).
  - DuanDH3: `GET /api/v1/categories`, `POST` (REQ-OFL-B-107) & Flyway V3 (orders), V4 (indexes) (REQ-OFL-B-108).
- **Day 3**:
  - HoangNQ17: Angular `ProductService` & Router/Sidebar (REQ-OFL-F-103, F-104).
  - DuanDH3: Angular `ProductListComponent` (Table + Pagination) (REQ-OFL-F-101).
- **Day 4**:
  - HoangNQ17: Angular `ProductFormComponent` (Reactive Forms) (REQ-OFL-F-102).
  - DuanDH3: Unit tests `CategoryService` (REQ-OFL-T-102) & Swagger UI verification (REQ-OFL-T-103).
- **Day 5**:
  - HoangNQ17: Unit tests `ProductService` (REQ-OFL-T-101).
  - DuanDH3: Redis `CartService` (addItem, updateQuantity, removeItem, getCart, clearCart) (REQ-OFL-B-201).

### Week 2
- **Day 6**:
  - HoangNQ17: Order REST APIs (REQ-OFL-B-204) & N+1 Query Optimization (`JOIN FETCH`/`@EntityGraph`) (REQ-OFL-B-205).
  - DuanDH3: Cart REST Endpoints (REQ-OFL-B-202) & Unit tests `CartService` (REQ-OFL-T-202).
- **Day 7**:
  - HoangNQ17: Transactional `OrderService.createOrder()` với Pessimistic Lock & Product ID Sorting chống deadlock (REQ-OFL-B-203).
  - DuanDH3: Angular `CartComponent` (REQ-OFL-F-201).
- **Day 8**:
  - HoangNQ17: Angular `OrderListComponent` (REQ-OFL-F-202) & `OrderDetailComponent` (REQ-OFL-F-203).
  - DuanDH3: RabbitMQ Exchanges/Queues/Bindings & `OrderEventPublisher` (REQ-OFL-B-207).
- **Day 9**:
  - HoangNQ17: Unit tests `OrderService.createOrder()` (REQ-OFL-T-201).
  - DuanDH3: `PaymentConsumer` (Mock) & `NotificationConsumer` (MailHog Email) (REQ-OFL-B-208, B-209).
- **Day 10**:
  - HoangNQ17: Postgres Full-Text Search `tsvector` & Angular Search Bar (REQ-OFL-B-206, F-204).
  - DuanDH3: Redis Product Detail Cache & Invalidation (REQ-OFL-B-210).

### Week 3
- **Day 11**:
  - HoangNQ17: Redis Rate Limiting (100 req/min/IP) (REQ-OFL-B-304).
  - DuanDH3: Admin Order REST Endpoints (REQ-OFL-B-306).
- **Day 12**:
  - HoangNQ17: `BaseIntegrationTest` & E2E Order Flow integration test (REQ-OFL-B-301).
  - DuanDH3: Angular `AdminOrderListComponent` (REQ-OFL-F-301, F-302).
- **Day 13**:
  - HoangNQ17: DB Query Tuning (`EXPLAIN ANALYZE` & Indexing) (REQ-OFL-B-305).
  - DuanDH3: Angular `DashboardComponent` (Cards) (REQ-OFL-F-303).
- **Day 14**:
  - HoangNQ17: Concurrency Stock Lock Test (10 threads purchasing product) (REQ-OFL-B-302).
  - DuanDH3: RabbitMQ Retry with Exponential Backoff & DLQ (REQ-OFL-B-303, T-303).
- **Day 15**:
  - HoangNQ17: Concurrency Test Stability Verification (REQ-OFL-T-302).
  - DuanDH3: Swagger OpenAPI Completion & Testcontainers Tests (REQ-OFL-B-307, T-301).

### Week 4
- **Day 16**: E2E Flow Validation & Fix Mentor Bugs (REQ-OFL-W-401, W-403) *(HoangNQ17 & DuanDH3)*
- **Day 17**: Cross-team Code Review Team 2 ClinicQ (REQ-OFL-W-402) *(HoangNQ17 & DuanDH3)*
- **Day 18**: Stress Testing Apache Bench (REQ-OFL-W-404) *(HoangNQ17)* & System README Documentation (REQ-OFL-W-405) *(DuanDH3)*
- **Day 19**: Code Cleanup, QA Review & Build Verification *(HoangNQ17 & DuanDH3)*
- **Day 20**: Slide Preparation & Live Demo 15-20 min (REQ-OFL-W-406) *(HoangNQ17 & DuanDH3)*

---

## 5. Non-Functional Requirements (NFRs)

1. **Latency**: API đọc < 100ms với Redis; API ghi đơn hàng < 500ms.
2. **Concurrency & Consistency**: Locking bi quan `PESSIMISTIC_WRITE`, sắp xếp Product ID để phòng chống Deadlock, tuyệt đối không overselling.
3. **Resilience**: RabbitMQ Exponential Backoff Retry (3 lần) + Dead Letter Queue (DLQ).
4. **Security**: JWT Authentication + Redis Rate Limiter (100 req/min/IP).
5. **Testing & Performance**: Unit tests > 80% coverage, Testcontainers integration tests, Apache Bench (`ab -n 1000 -c 50`, avg < 200ms, error < 1%).
