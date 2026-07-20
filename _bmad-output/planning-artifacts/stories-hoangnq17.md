# OrderFlow - Story Backlog: HoangNQ17

**Developer**: HoangNQ17  
**Project**: OrderFlow E-Commerce System  
**Timeline**: 4 Weeks (20 Days: 2026-07-20 to 2026-08-14)  

---

## Week 1: Catalog & Shopping Cart

### Story H-01 (Day 1 - Mon, 2026-07-20): Entity & Migration Setup for Category & Product `[Completed]`
- **Title**: Implement Category & Product JPA Entities, V2 migrations, and initial CRUD service logic
- **IDs**: REQ-OFL-B-101, REQ-OFL-B-102, REQ-OFL-B-103, REQ-OFL-B-104
- **Tasks**:
  1. Define `Category` and `Product` JPA entities extending `BaseEntity`.
  2. Write Flyway migration V2 for `categories` and `products` tables (including `search_vector TSVECTOR`).
  3. Implement base repositories and initial service layer CRUD logic using MapStruct.
- **Acceptance Criteria**:
  - Entities compiled without errors and mapped to DB fields correctly.
  - Flyway migration V2 executes successfully on PostgreSQL.

---

### Story H-02 (Day 2 - Tue, 2026-07-21): Product Catalog Backend REST Endpoints
- **Title**: Implement paginated Product List API and Product REST Endpoints
- **IDs**: REQ-OFL-B-105, REQ-OFL-B-106
- **Tasks**:
  1. Implement `GET /api/v1/products` API with pagination (`page`, `size`, `sort`).
  2. Implement `GET /api/v1/products/{id}`, `POST`, `PUT`, `DELETE /api/v1/products/{id}` endpoints.
  3. Support soft delete by setting `active=false` on DELETE.
- **Acceptance Criteria**:
  - Endpoint `GET /api/v1/products` returns `PageResponse<ProductResponse>` with status HTTP 200.
  - CRUD operations function correctly with validation and soft delete.

---

### Story H-03 (Day 3 - Wed, 2026-07-22): Angular Product Catalog Service & Navigation
- **Title**: Create Angular ProductService and register Sidebar Navigation paths
- **IDs**: REQ-OFL-F-103, REQ-OFL-F-104
- **Tasks**:
  1. Write Angular `ProductService` interacting with Backend Product REST APIs via RxJS.
  2. Configure Angular Router paths for Product module.
  3. Register Product navigation item in main layout sidebar.
- **Acceptance Criteria**:
  - `ProductService` sends valid HTTP requests with JWT tokens attached.
  - Clicking Product menu item in sidebar navigates to Product module route correctly.

---

### Story H-04 (Day 4 - Thu, 2026-07-23): Angular Product Form Component (Reactive Forms)
- **Title**: Create Angular ProductFormComponent for Product Creation & Editing
- **IDs**: REQ-OFL-F-102
- **Tasks**:
  1. Build `ProductFormComponent` using Angular Reactive Forms.
  2. Add form validations (name required, price > 0, stock >= 0, category dropdown, active toggle).
  3. Connect component with `ProductService` for create & update actions with snackbar feedback.
- **Acceptance Criteria**:
  - Form displays appropriate validation errors for invalid inputs.
  - Creating or updating a product successfully saves data and navigates back to list.

---

### Story H-05 (Day 5 - Fri, 2026-07-24): Unit Testing for ProductService
- **Title**: Write Unit Tests for ProductService
- **IDs**: REQ-OFL-T-101
- **Tasks**:
  1. Write JUnit 5 & Mockito unit tests for `ProductService` implementation (min 5 tests).
  2. Test success cases: create (valid + duplicate slug), getById (found + not found), update, delete.
- **Acceptance Criteria**:
  - Minimum 5 unit tests for ProductService pass 100%.

---

## Week 2: Shopping Cart, Order Placement & Transactions

### Story H-06 (Day 6 - Mon, 2026-07-27): Order REST Endpoints & N+1 Query Optimization
- **Title**: Implement Order REST Endpoints and Optimize N+1 Query Issue
- **IDs**: REQ-OFL-B-204, REQ-OFL-B-205
- **Tasks**:
  1. Create `OrderController` (`POST /api/v1/orders`, `GET /api/v1/orders` my orders paginated, `GET /api/v1/orders/{id}`, `PUT /api/v1/orders/{id}/cancel`).
  2. Apply JPA `@EntityGraph` or `JOIN FETCH` in `OrderRepository` to solve N+1 query issue when loading order items.
- **Acceptance Criteria**:
  - Querying customer orders executes exactly 1 SQL query with `JOIN FETCH`.
  - All order REST endpoints function properly.

---

### Story H-07 (Day 7 - Tue, 2026-07-28): Transactional Order Creation with Pessimistic Locking & Deadlock Prevention
- **Title**: Implement Transactional OrderService.createOrder() with Pessimistic Stock Lock
- **IDs**: REQ-OFL-B-203
- **Tasks**:
  1. Get cart items from Redis (`cart:{userId}`).
  2. Lock products with `PESSIMISTIC_WRITE` and **sort product IDs before locking to prevent deadlock**.
  3. Validate stock availability, decrease stock, create order + order_items, clear cart, publish `OrderCreatedEvent`.
- **Acceptance Criteria**:
  - Order creation acquires pessimistic lock on sorted product IDs to prevent deadlock under concurrent transactions.
  - Insufficient stock throws exception and rolls back transaction.

---

### Story H-08 (Day 8 - Wed, 2026-07-29): Angular Customer Order Components
- **Title**: Create Angular OrderListComponent & OrderDetailComponent
- **IDs**: REQ-OFL-F-202, REQ-OFL-F-203
- **Tasks**:
  1. Create `OrderListComponent` to show customer order history (columns: Order ID, Date, Status, Total, Actions).
  2. Create `OrderDetailComponent` to display order summary & items list.
- **Acceptance Criteria**:
  - Customer can view their historical orders and click to see detailed item breakdowns.

---

### Story H-09 (Day 9 - Thu, 2026-07-30): Unit Testing for OrderService
- **Title**: Write Unit Tests for OrderService.createOrder()
- **IDs**: REQ-OFL-T-201
- **Tasks**:
  1. Write JUnit 5 & Mockito unit tests for `OrderService.createOrder()` (min 3 tests).
  2. Test scenarios: success flow, insufficient stock, empty cart.
- **Acceptance Criteria**:
  - All 3+ unit tests pass 100%.

---

### Story H-10 (Day 10 - Fri, 2026-07-31): PostgreSQL Full-Text Search Integration
- **Title**: Implement PostgreSQL Full-Text Search tsvector & Angular Search Bar
- **IDs**: REQ-OFL-B-206, REQ-OFL-F-204
- **Tasks**:
  1. Add `GET /api/v1/products/search?q=` endpoint utilizing `search_vector` TSVECTOR & GIN index.
  2. Integrate search bar on Angular product list page calling the search endpoint.
- **Acceptance Criteria**:
  - Full-text search endpoint returns matching products quickly using GIN index.
  - Angular search bar updates product list as user types.

---

## Week 3: Caching, Rate Limiting, Admin Operations & Verification

### Story H-11 (Day 11 - Mon, 2026-08-03): Redis-Based API Rate Limiting
- **Title**: Implement Redis-Based API Rate Limiter (100 req/min/IP)
- **IDs**: REQ-OFL-B-304
- **Tasks**:
  1. Implement rate limiter using Redis `INCR` + `EXPIRE`.
  2. Limit to 100 requests/minute per IP address. Return HTTP 429 Too Many Requests when exceeded.
- **Acceptance Criteria**:
  - IP exceeding 100 req/min receives HTTP 429 status response.

---

### Story H-12 (Day 12 - Tue, 2026-08-04): E2E Base Integration Test
- **Title**: Write BaseIntegrationTest and E2E Order Flow Integration Test
- **IDs**: REQ-OFL-B-301
- **Tasks**:
  1. Extend starter's `BaseIntegrationTest` using Testcontainers.
  2. Test flow: register -> login -> add to cart -> create order -> verify stock decreased.
- **Acceptance Criteria**:
  - Integration test executes full flow with Testcontainers successfully.

---

### Story H-13 (Day 13 - Wed, 2026-08-05): Database Query Tuning & Profiling
- **Title**: Profile Slow Queries using EXPLAIN ANALYZE and Optimize Database Indexes
- **IDs**: REQ-OFL-B-305
- **Tasks**:
  1. Run `EXPLAIN ANALYZE` on top 3 most-used queries.
  2. Document query plans and ensure indexes in Flyway V4 (`idx_products_category`, `idx_orders_user`, etc.) are utilized.
- **Acceptance Criteria**:
  - Documented query execution plans show index scans instead of sequential table scans.

---

### Story H-14 (Day 14 - Thu, 2026-08-06): Concurrency Stock Lock Testing
- **Title**: Write Integration Test Verifying Concurrent Stock Locking (10 Threads)
- **IDs**: REQ-OFL-B-302
- **Tasks**:
  1. Write concurrent stock test: 10 threads simultaneously create orders for same product (stock=10).
  2. Verify final stock = 0 and no overselling occurred.
- **Acceptance Criteria**:
  - Final stock equals 0, exactly 10 orders created, zero overselling.

---

### Story H-15 (Day 15 - Fri, 2026-08-07): Concurrency Test Verification & Stability
- **Title**: Verify Concurrent Stock Locking Test Stability
- **IDs**: REQ-OFL-T-302
- **Tasks**:
  1. Execute concurrent test verifying pessimistic lock prevents overselling repeatedly.
- **Acceptance Criteria**:
  - 100% pass rate under stress execution.

---

## Week 4: End-to-End, Bug Fixes, Performance & Delivery

### Story H-16 (Day 16 - Mon, 2026-08-10): E2E Flow Validation & Bug Triage
- **Title**: Validate Full E2E Flow and Fix Mentor Bug Reports
- **IDs**: REQ-OFL-W-401, REQ-OFL-W-403
- **Tasks**:
  1. Complete end-to-end flow validation (register -> login -> browse -> cart -> order -> payment -> email -> status).
  2. Fix mentor-created bug issues (min 5 bugs).
- **Acceptance Criteria**:
  - Full E2E flow functions end-to-end, at least 5 bugs fixed.

---

### Story H-17 (Day 17 - Tue, 2026-08-11): Cross-Team Code Review (ClinicQ)
- **Title**: Conduct Cross-Reviews of Team 2 (ClinicQ) Codebase
- **IDs**: REQ-OFL-W-402
- **Tasks**:
  1. Review Team 2 (ClinicQ) pull requests and leave >= 10 comments.
- **Acceptance Criteria**:
  - Minimum 10 constructive code review comments recorded.

---

### Story H-18 (Day 18 - Wed, 2026-08-12): Stress Testing with Apache Bench
- **Title**: Conduct Stress Testing with Apache Bench (`ab -n 1000 -c 50`)
- **IDs**: REQ-OFL-W-404
- **Tasks**:
  1. Run `ab -n 1000 -c 50` performance test.
  2. Target metrics: Average latency < 200ms, Error rate < 1%.
- **Acceptance Criteria**:
  - Apache Bench benchmark meets target metrics (avg < 200ms, error < 1%).

---

### Story H-19 (Day 19 - Thu, 2026-08-13): Final Code Cleanup & QA Build Verification
- **Title**: Final Code Cleanup, Refactoring & Test Coverage Verification
- **Tasks**:
  1. Code formatting cleanup and test verification.
- **Acceptance Criteria**:
  - Clean build without test failures.

---

### Story H-20 (Day 20 - Fri, 2026-08-14): Presentation Preparation & Live Demo
- **Title**: Prepare Presentation Slides and Deliver Live Demonstration
- **IDs**: REQ-OFL-W-406
- **Tasks**:
  1. Prepare presentation slides and participate in 15-20 min live demo presentation covering overview, demo, code walkthrough, Q&A.
- **Acceptance Criteria**:
  - Successful 15-20 min live demonstration.
