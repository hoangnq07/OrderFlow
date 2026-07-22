---
baseline_commit: f12b4ce
---
# Story 3.1: API Rate Limiting and Admin Order Backend APIs

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an admin,
I want a Redis-based API rate limiter (100 req/min/IP) and Admin Order management backend REST APIs,
so that the API infrastructure is protected against abuse and administrators can query and update customer order statuses.

## Acceptance Criteria

1. **Redis API Rate Limiting (`REQ-OFL-B-304`)**:
   - Create `RateLimitingFilter` extending `OncePerRequestFilter` in `backend/src/main/java/com/training/starter/security/RateLimitingFilter.java`.
   - Limiting rule: Maximum 100 requests per minute per IP address (`100 req/min/IP`).
   - Uses `StringRedisTemplate` with atomic `INCR` and `EXPIRE 60s` on key format `rate_limit:{client_ip}`.
   - Client IP extraction: Inspects `X-Forwarded-For` header (first IP in comma-separated list if present), fallback to `request.getRemoteAddr()`.
   - When request count <= 100:
     - Allows request to proceed down `filterChain`.
     - Appends standard HTTP headers:
       - `X-RateLimit-Limit: 100`
       - `X-RateLimit-Remaining: <100 - count>`
       - `X-RateLimit-Reset: <remaining_seconds_in_window>`
   - When request count > 100:
     - Blocks request immediately with HTTP 429 status code (`HttpStatus.TOO_MANY_REQUESTS`).
     - Returns JSON response matching standard `ApiResponse.error(429, "Rate limit exceeded. Maximum 100 requests per minute allowed.")`.

2. **Admin Order Management REST APIs (`REQ-OFL-B-306`)**:
   - `OrderStatus` enum in `backend/src/main/java/com/training/starter/enums/OrderStatus.java` (values: `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
   - `Order` & `OrderItem` JPA entities mapped to database tables `orders` and `order_items`.
   - `AdminOrderController` created under `/api/v1/admin/orders` protected by `@PreAuthorize("hasRole('ADMIN')")`.
   - Endpoints implemented:
     - `GET /api/v1/admin/orders`:
       - Accepts pagination query parameters (`page`, `size`, `sort`) and optional `status` filter (`OrderStatus`).
       - Uses `OrderRepository` query with `JOIN FETCH` / `@EntityGraph` to prevent N+1 query issues.
       - Returns `ApiResponse<PageResponse<OrderResponse>>`.
     - `PUT /api/v1/admin/orders/{id}/status`:
       - Accepts `@Valid @RequestBody UpdateOrderStatusRequest request` containing `status` and `note`.
       - Validates allowed order status transitions (e.g. `PENDING` -> `CONFIRMED` -> `PROCESSING` -> `SHIPPED` -> `DELIVERED` or `CANCELLED`).
       - Returns updated `ApiResponse<OrderResponse>`.

3. **Backend Unit Tests (`REQ-OFL-T-304`, `REQ-OFL-B-306`)**:
   - `RateLimitingFilterTest.java` in `backend/src/test/java/com/training/starter/security/RateLimitingFilterTest.java`:
     - Verifies requests under limit (<= 100) pass with rate limit headers.
     - Verifies 101st request receives HTTP 429 status response.
   - `AdminOrderServiceTest.java` in `backend/src/test/java/com/training/starter/service/AdminOrderServiceTest.java`:
     - Verifies paginated order retrieval and status filtering for admin.
     - Verifies status transition validation (valid transition updates status, invalid transition throws exception).

4. **Build & Test Verification (`REQ-OFL-B-304`, `REQ-OFL-B-306`)**:
   - Backend unit tests (`./mvnw test -Dtest=RateLimitingFilterTest,AdminOrderServiceTest` in `backend/`) pass 100%.
   - Backend compilation (`./mvnw clean compile` in `backend/`) completes with 0 errors.

## Tasks / Subtasks

- [x] Task 1: Implement Redis-Based `RateLimitingFilter` (`REQ-OFL-B-304`) (AC: #1)
  - [x] Create `backend/src/main/java/com/training/starter/security/RateLimitingFilter.java` extending `OncePerRequestFilter`.
  - [x] Inject `StringRedisTemplate`.
  - [x] Extract client IP from `X-Forwarded-For` or `request.getRemoteAddr()`.
  - [x] Implement atomic Redis key `rate_limit:{ip}` counter with 60s expiration.
  - [x] Return HTTP 429 JSON response when request count exceeds 100.
  - [x] Add rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`) on permitted requests.
  - [x] Register `RateLimitingFilter` in `SecurityConfig.java`.

- [x] Task 2: Implement Admin Order REST Endpoints (`REQ-OFL-B-306`) (AC: #2)
  - [x] Create `OrderStatus` enum in `backend/src/main/java/com/training/starter/enums/OrderStatus.java`.
  - [x] Create `UpdateOrderStatusRequest` record in `backend/src/main/java/com/training/starter/dto/request/UpdateOrderStatusRequest.java`.
  - [x] Add admin order methods in `OrderService` & `OrderServiceImpl`: `getAdminOrders(OrderStatus status, Pageable pageable)` and `updateOrderStatusByAdmin(Long orderId, UpdateOrderStatusRequest request)`.
  - [x] Implement status transition validation logic in `OrderServiceImpl`.
  - [x] Create `AdminOrderController` in `backend/src/main/java/com/training/starter/controller/AdminOrderController.java` (`GET /api/v1/admin/orders` and `PUT /api/v1/admin/orders/{id}/status`).
  - [x] Annotate `AdminOrderController` with `@PreAuthorize("hasRole('ADMIN')")` and OpenAPI `@Tag` / `@Operation` annotations.

- [x] Task 3: Author Backend Unit Tests (`REQ-OFL-T-304`, `REQ-OFL-B-306`) (AC: #3)
  - [x] Create `backend/src/test/java/com/training/starter/security/RateLimitingFilterTest.java` using Mockito & `MockHttpServletRequest` / `MockHttpServletResponse`.
  - [x] Create `backend/src/test/java/com/training/starter/service/AdminOrderServiceTest.java` verifying admin order query and status transition rules.

- [x] Task 4: Build Verification & Test Execution (AC: #4)
  - [x] Execute `cd backend && .\mvnw.cmd test "-Dtest=RateLimitingFilterTest,AdminOrderServiceTest"` to verify unit tests pass 100%.
  - [x] Execute `cd backend && .\mvnw.cmd compile` to verify compilation.

## Dev Notes

### Architecture & Technical Guardrails

1. **Redis Rate Limiter Implementation**:
   - Use `StringRedisTemplate` with atomic `INCR` operation.
   - Sample Redis rate limiting logic:
     ```java
     String key = "rate_limit:" + clientIp;
     Long count = redisTemplate.opsForValue().increment(key);
     if (count != null && count == 1) {
         redisTemplate.expire(key, 60, TimeUnit.SECONDS);
     }
     ```
   - Client IP extraction helper:
     ```java
     String xForwardedFor = request.getHeader("X-Forwarded-For");
     String clientIp = (xForwardedFor != null && !xForwardedFor.isBlank())
             ? xForwardedFor.split(",")[0].trim()
             : request.getRemoteAddr();
     ```

2. **Security & Role Authorization**:
   - Ensure `/api/v1/admin/**` endpoints are protected by `hasRole('ADMIN')`.
   - Update `SecurityConfig.java` to include `RateLimitingFilter` before `UsernamePasswordAuthenticationFilter` or `JwtAuthenticationFilter`.

3. **Order Status Transition Rules**:
   - `PENDING` -> `CONFIRMED`, `CANCELLED`
   - `CONFIRMED` -> `PROCESSING`, `CANCELLED`
   - `PROCESSING` -> `SHIPPED`, `CANCELLED`
   - `SHIPPED` -> `DELIVERED`
   - `DELIVERED` & `CANCELLED` -> Terminal states (no further transitions allowed).

4. **Testing Standards**:
   - JUnit 5 (`@Test`), Mockito (`@Mock`, `@InjectMocks`), AssertJ (`assertThat`, `assertThatThrownBy`).

### Source Tree Components

- `backend/src/main/java/com/training/starter/security/RateLimitingFilter.java` [NEW]
- `backend/src/main/java/com/training/starter/security/SecurityConfig.java` [MODIFY]
- `backend/src/main/java/com/training/starter/enums/OrderStatus.java` [NEW]
- `backend/src/main/java/com/training/starter/entity/Order.java` [NEW]
- `backend/src/main/java/com/training/starter/entity/OrderItem.java` [NEW]
- `backend/src/main/java/com/training/starter/repository/OrderRepository.java` [NEW]
- `backend/src/main/java/com/training/starter/mapper/OrderMapper.java` [NEW]
- `backend/src/main/java/com/training/starter/dto/request/UpdateOrderStatusRequest.java` [NEW]
- `backend/src/main/java/com/training/starter/dto/response/OrderResponse.java` [NEW]
- `backend/src/main/java/com/training/starter/dto/response/OrderItemResponse.java` [NEW]
- `backend/src/main/java/com/training/starter/service/OrderService.java` [NEW]
- `backend/src/main/java/com/training/starter/service/impl/OrderServiceImpl.java` [NEW]
- `backend/src/main/java/com/training/starter/controller/AdminOrderController.java` [NEW]
- `backend/src/test/java/com/training/starter/security/RateLimitingFilterTest.java` [NEW]
- `backend/src/test/java/com/training/starter/service/AdminOrderServiceTest.java` [NEW]

### Previous Story Intelligence

- **Story 1.1-1.3 & 2.1-2.3**: `ApiResponse<T>` and `PageResponse<T>` are located under `com.training.starter.common`. JWT security filter handles Bearer token authentication.

### Dev Agent Guardrails & Common Mistakes Avoidance

- **Do NOT hardcode IP addresses**: Extract IP dynamically from `X-Forwarded-For` or `request.getRemoteAddr()`.
- **Do NOT execute slow DB operations inside rate limiter filter**: Rate limiter uses Redis fast in-memory key lookup.
- **Do NOT bypass status transition validation**: Admin status updates validate allowed state transitions in service layer.

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (High)

### Debug Log References

N/A

### Completion Notes List

- Implemented Redis-based `RateLimitingFilter` enforcing 100 req/min/IP with `X-RateLimit` response headers and HTTP 429 status code handling. Registered filter before `JwtAuthenticationFilter` in `SecurityConfig.java`.
- Implemented `OrderStatus` enum, `Order` & `OrderItem` JPA entities, `OrderRepository` with `@EntityGraph` for N+1 query prevention, `OrderMapper`, `OrderService`, `OrderServiceImpl` (with status transition validation logic), and `AdminOrderController` (`GET /api/v1/admin/orders` and `PUT /api/v1/admin/orders/{id}/status`).
- Authored `RateLimitingFilterTest.java` (4 tests) and `AdminOrderServiceTest.java` (5 tests). All 9 unit tests passed 100%.
- Verified backend compilation (`.\mvnw.cmd compile`) succeeded with 0 errors.

### File List

- `backend/src/main/java/com/training/starter/security/RateLimitingFilter.java`
- `backend/src/main/java/com/training/starter/security/SecurityConfig.java`
- `backend/src/main/java/com/training/starter/enums/OrderStatus.java`
- `backend/src/main/java/com/training/starter/entity/Order.java`
- `backend/src/main/java/com/training/starter/entity/OrderItem.java`
- `backend/src/main/java/com/training/starter/repository/OrderRepository.java`
- `backend/src/main/java/com/training/starter/mapper/OrderMapper.java`
- `backend/src/main/java/com/training/starter/dto/request/UpdateOrderStatusRequest.java`
- `backend/src/main/java/com/training/starter/dto/response/OrderResponse.java`
- `backend/src/main/java/com/training/starter/dto/response/OrderItemResponse.java`
- `backend/src/main/java/com/training/starter/service/OrderService.java`
- `backend/src/main/java/com/training/starter/service/impl/OrderServiceImpl.java`
- `backend/src/main/java/com/training/starter/controller/AdminOrderController.java`
- `backend/src/test/java/com/training/starter/security/RateLimitingFilterTest.java`
- `backend/src/test/java/com/training/starter/service/AdminOrderServiceTest.java`
