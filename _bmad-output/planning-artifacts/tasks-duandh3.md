# OrderFlow - Task Backlog: DuanDH3

**Developer**: DuanDH3  
**Project**: OrderFlow E-Commerce System  
**Timeline**: 4 Weeks (20 Days: 2026-07-20 to 2026-08-14)  

---

## Week 1: Catalog & Shopping Cart

### Task D-01 (Day 1 - Mon, 2026-07-20): Infrastructure Setup & Environment Verification `[Completed]`
- **Title**: Git repo setups, starter codebase exploration, database environment docker compose checks
- **IDs**: REQ-OFL-B-101, REQ-OFL-B-102
- **Tasks**:
  1. Clone repository and verify Git setup.
  2. Start local infrastructure using Docker Compose (`docker compose up -d`).
  3. Verify PostgreSQL (5432), Redis (6379), RabbitMQ (5672/15672), MailHog (8025) containers running.
- **Acceptance Criteria**:
  - All 4 containers running smoothly without restart loops.
  - Maven backend and Angular frontend start locally without errors.

---

### Task D-02 (Day 2 - Tue, 2026-07-21): Category Backend Endpoints & Flyway Migrations
- **Title**: Implement Category REST Endpoints and Prepare Flyway Migrations V3 & V4
- **IDs**: REQ-OFL-B-107, REQ-OFL-B-108
- **Tasks**:
  1. Implement `CategoryController` (`GET /api/v1/categories`, `POST /api/v1/categories`).
  2. Write Flyway migration V3 for `orders` and `order_items` tables.
  3. Prepare Flyway migration V4 for database indexes.
- **Acceptance Criteria**:
  - Category REST endpoints return valid JSON responses.
  - Migrations V3 and V4 run cleanly on database startup.

---

### Task D-03 (Day 3 - Wed, 2026-07-22): Angular Product & Category Table View Component
- **Title**: Create Angular ProductListComponent Displaying Products and Categories
- **IDs**: REQ-OFL-F-101
- **Tasks**:
  1. Create `ProductListComponent` displaying products and their categories in a table.
  2. Add Angular Material pagination component connected to backend page requests.
  3. Add category dropdown filter to filter products by category.
- **Acceptance Criteria**:
  - Product list displays product details, category names, prices, and stock.
  - Pagination and category filtering work interactively.

---

### Task D-04 (Day 4 - Thu, 2026-07-23): Category Unit Tests & Swagger UI Documentation
- **Title**: Write Unit Tests for CategoryService and Verify Swagger UI Documentation
- **IDs**: REQ-OFL-T-102, REQ-OFL-T-103
- **Tasks**:
  1. Write JUnit 5 & Mockito unit tests for `CategoryService`.
  2. Annotate Category & Product REST Controllers with SpringDoc OpenAPI annotations.
  3. Verify Swagger UI interactive documentation (`http://localhost:8080/swagger-ui.html`).
- **Acceptance Criteria**:
  - `CategoryService` unit tests pass 100%.
  - Swagger UI renders clean endpoint documentation with request/response schemas.

---

### Task D-05 (Day 5 - Fri, 2026-07-24): Redis-Based Shopping Cart Service
- **Title**: Implement Redis-Based CartService
- **IDs**: REQ-OFL-B-201
- **Tasks**:
  1. Configure `RedisTemplate` with Jackson JSON serializer for Cart storage.
  2. Implement `CartService` methods: `addItem`, `updateQuantity`, `removeItem`, `getCart`, `clearCart`.
  3. Set cart TTL (e.g. 7 days inactivity expiration).
- **Acceptance Criteria**:
  - Cart items persist correctly in Redis key-value store under user session/ID.

---

## Week 2: Shopping Cart, Order Placement & Transactions

### Task D-06 (Day 6 - Mon, 2026-07-27): Cart REST Endpoints & Unit Tests
- **Title**: Create Cart REST Endpoints and Write Unit Tests for CartService
- **IDs**: REQ-OFL-B-202, REQ-OFL-T-202
- **Tasks**:
  1. Create `CartController` (`GET /api/v1/cart`, `POST /api/v1/cart/items`, `PUT`, `DELETE`).
  2. Write unit tests for `CartService` verifying Redis operations.
- **Acceptance Criteria**:
  - Cart endpoints perform cart modifications cleanly.
  - Unit tests for `CartService` pass 100%.

---

### Task D-07 (Day 7 - Tue, 2026-07-28): Angular Cart Component UI
- **Title**: Create Angular CartComponent with Quantity Adjustments & Clear Actions
- **IDs**: REQ-OFL-F-201
- **Tasks**:
  1. Build `CartComponent` displaying current items in shopping cart.
  2. Add buttons for incrementing/decrementing item quantities and removing items.
  3. Add "Clear Cart" and "Proceed to Checkout" action buttons.
- **Acceptance Criteria**:
  - User can modify cart quantities dynamically with instant UI updates.
  - Empty cart state displays appropriate user notification.

---

### Task D-08 (Day 8 - Wed, 2026-07-29): RabbitMQ Messaging Infrastructure Setup
- **Title**: Set up RabbitMQ Exchanges, Queues, Bindings, and OrderEventPublisher
- **IDs**: REQ-OFL-B-207
- **Tasks**:
  1. Configure RabbitMQ Topic Exchange (`order.exchange`) and Queues (`payment.queue`, `notification.queue`).
  2. Configure queue bindings with routing keys (`order.created`).
  3. Implement `OrderEventPublisher` publishing `OrderCreatedEvent`.
- **Acceptance Criteria**:
  - `OrderCreatedEvent` published to Exchange is routed to both payment and notification queues.

---

### Task D-09 (Day 9 - Thu, 2026-07-30): RabbitMQ Async Consumers (Payment Mock & MailHog Email)
- **Title**: Implement PaymentConsumer Mock and NotificationConsumer (MailHog)
- **IDs**: REQ-OFL-B-208, REQ-OFL-B-209
- **Tasks**:
  1. Implement `@RabbitListener` `PaymentConsumer` simulating mock payment verification.
  2. Implement `@RabbitListener` `NotificationConsumer` sending order confirmation emails via JavaMailSender.
  3. Verify email delivery in MailHog Web UI (`http://localhost:8025`).
- **Acceptance Criteria**:
  - Placing an order triggers asynchronous payment mock processing and email sending.
  - Emails appear correctly formatted in MailHog UI.

---

### Task D-10 (Day 10 - Fri, 2026-07-31): Redis Product Detail Caching
- **Title**: Implement Redis Product Caching on Detail Endpoints with Cache Invalidation
- **IDs**: REQ-OFL-B-210
- **Tasks**:
  1. Enable Spring Cache abstraction with `@Cacheable(value = "products", key = "#id")`.
  2. Add `@CacheEvict` on product update & delete operations.
- **Acceptance Criteria**:
  - Subsequent requests to `GET /api/v1/products/{id}` hit Redis cache (verifiable via log output).
  - Updating a product clears its cache entry immediately.

---

## Week 3: Caching, Rate Limiting, Admin Operations & Verification

### Task D-11 (Day 11 - Mon, 2026-08-03): Admin Order Backend REST Endpoints
- **Title**: Implement Admin Order REST Endpoints (GET Orders with Filters, PUT Status Updates)
- **IDs**: REQ-OFL-B-306
- **Tasks**:
  1. Implement `AdminOrderController` (`GET /api/v1/admin/orders` with status & date filters).
  2. Implement `PUT /api/v1/admin/orders/{id}/status` to update order status.
- **Acceptance Criteria**:
  - Admin can retrieve filtered order lists and update status (PENDING -> PROCESSING -> COMPLETED/CANCELLED).

---

### Task D-12 (Day 12 - Tue, 2026-08-04): Angular Admin Order Management UI
- **Title**: Create Angular AdminOrderListComponent
- **IDs**: REQ-OFL-F-301, REQ-OFL-F-302
- **Tasks**:
  1. Create `AdminOrderListComponent` featuring an orders data table.
  2. Add status filter dropdown and date range picker.
  3. Implement inline/dialog action to change order status.
- **Acceptance Criteria**:
  - Admin UI lists all customer orders with filter and status change capabilities.

---

### Task D-13 (Day 13 - Wed, 2026-08-05): Angular Admin Dashboard Component
- **Title**: Create Angular DashboardComponent Showing Summary Cards
- **IDs**: REQ-OFL-F-303
- **Tasks**:
  1. Implement `DashboardComponent` in Angular.
  2. Create summary cards for Total Orders, Pending Orders, and Total Revenue.
  3. Connect component to backend dashboard analytics API.
- **Acceptance Criteria**:
  - Dashboard cards display accurate aggregated metrics.

---

### Task D-14 (Day 14 - Thu, 2026-08-06): RabbitMQ Retry with Exponential Backoff & DLQ Setup
- **Title**: Configure RabbitMQ Retry Policy and Dead Letter Queue (DLQ)
- **IDs**: REQ-OFL-B-303, REQ-OFL-T-303
- **Tasks**:
  1. Configure `DeadLetterExchange` and `order.dlq` queue in RabbitMQ configuration.
  2. Set up message retry with exponential backoff (e.g. initial 1s, multiplier 2, max 3 attempts).
  3. Write integration test verifying failed message routing to DLQ.
- **Acceptance Criteria**:
  - Messages failing consumer processing are retried 3 times before being routed to DLQ.

---

### Task D-15 (Day 15 - Fri, 2026-08-07): Swagger / OpenAPI Completion & Testcontainers Integration
- **Title**: Complete OpenAPI Annotations and Write Testcontainers Integration Tests
- **IDs**: REQ-OFL-B-307, REQ-OFL-T-301
- **Tasks**:
  1. Complete Swagger annotations across all controllers and DTOs.
  2. Write integration tests for `CartService` and `RabbitMQ` messaging using Testcontainers.
- **Acceptance Criteria**:
  - Testcontainers tests pass in Maven build environment without external service dependency.

---

## Week 4: End-to-End, Bug Fixes, Performance & Delivery

### Task D-16 (Day 16 - Mon, 2026-08-10): E2E System Validation & Bug Fixes
- **Title**: Validate Full E2E Flow and Fix Assigned Mentor Issues
- **IDs**: REQ-OFL-W-401, REQ-OFL-W-403
- **Tasks**:
  1. Assist in full system E2E validation.
  2. Fix bugs and issues assigned by mentors.
- **Acceptance Criteria**:
  - E2E flow works end-to-end without UI or backend crashes.

---

### Task D-17 (Day 17 - Tue, 2026-08-11): Cross-Team Code Review (ClinicQ)
- **Title**: Conduct Cross-Reviews of Team 2 (ClinicQ) Codebase
- **IDs**: REQ-OFL-W-402
- **Tasks**:
  1. Perform code review on Team 2's pull requests.
  2. Add detailed technical feedback and suggestions.
- **Acceptance Criteria**:
  - At least 5+ detailed review comments submitted by DuanDH3.

---

### Task D-18 (Day 18 - Wed, 2026-08-12): System Architecture Documentation in README
- **Title**: Compile System Architecture & Local Setup Guide in README.md
- **IDs**: REQ-OFL-W-405
- **Tasks**:
  1. Document system architecture diagram, tech stack, and component interactions in `README.md`.
  2. Document step-by-step local execution instructions and credentials.
- **Acceptance Criteria**:
  - `README.md` updated with comprehensive project documentation.

---

### Task D-19 (Day 19 - Thu, 2026-08-13): Final Code Cleanup & QA Verification
- **Title**: Final Code Cleanup & QA Verification
- **Tasks**:
  1. Conduct final code cleanup, format checking, and linting.
  2. Verify full test suite execution.
- **Acceptance Criteria**:
  - All tests passing cleanly.

---

### Task D-20 (Day 20 - Fri, 2026-08-14): Presentation Preparation & Live Demo Delivery
- **Title**: Prepare Presentation & Live Demo
- **IDs**: REQ-OFL-W-406
- **Tasks**:
  1. Co-prepare presentation slides and demo walkthrough.
  2. Deliver 15-20 min live demonstration with HoangNQ17.
- **Acceptance Criteria**:
  - Successful live presentation and demonstration.
