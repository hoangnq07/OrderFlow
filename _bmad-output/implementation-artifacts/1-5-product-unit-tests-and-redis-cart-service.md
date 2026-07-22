# Story 1.5: product-unit-tests-and-redis-cart-service

Status: done

## Story

As a customer / developer,
I want Unit Tests for ProductService and a Redis-backed CartService with DTO serialization and 7-day TTL,
so that product catalog operations are fully tested and user shopping cart state is fast, persistent, and secure.

## Acceptance Criteria

1. **Redis Cart Data Models & DTOs (`REQ-OFL-B-201`)**:
   - `CartItemResponse` record/class containing: `Long productId`, `String productName`, `String productSlug`, `BigDecimal unitPrice`, `Integer quantity`, `BigDecimal subtotal`, `String imageUrl`.
   - `CartResponse` record/class containing: `Long userId`, `List<CartItemResponse> items`, `BigDecimal totalAmount`, `Integer totalItems`.
   - `AddToCartRequest` record containing: `Long productId` (`@NotNull`), `Integer quantity` (`@NotNull`, `@Min(1)`).
   - `UpdateCartItemRequest` record containing: `Integer quantity` (`@NotNull`, `@Min(0)`).

2. **Redis-Backed CartService Implementation (`REQ-OFL-B-201`, `AGENTS.md Rule 11`)**:
   - `CartService` interface and `CartServiceImpl` implementation using `RedisTemplate<String, Object>`.
   - Key pattern: `cart:{userId}` using Redis Hash data structure (`field = productId.toString()`, `value = CartItemResponse`).
   - TTL management: Refresh key TTL to 7 days (`604800` seconds / `7 DAYS`) on any cart mutation or read.
   - Core methods:
     - `getCart(Long userId)`: Retrieves all hash entries from `cart:{userId}`, calculates `totalAmount` & `totalItems`, refreshes TTL.
     - `addItem(Long userId, AddToCartRequest request)`:
       - Validates requested `quantity > 0`.
       - Fetches authoritative `Product` from `ProductRepository` (throws `ResourceNotFoundException` if missing).
       - Validates product `active == true` (throws `BadRequestException` if inactive).
       - Validates requested quantity against product stock (throws `BadRequestException` if requested > stock).
       - Uses backend authoritative product price (`BigDecimal`). Calculates `subtotal = unitPrice * quantity`.
       - If item already exists in cart, merges quantity (capping at product stock).
       - Saves to Redis Hash `cart:{userId}`, refreshes 7-day TTL.
     - `updateQuantity(Long userId, Long productId, int quantity)`:
       - If `quantity <= 0`, calls `removeItem(userId, productId)`.
       - Else validates product exists, is active, and stock availability, updates item quantity and subtotal, saves to Redis, refreshes TTL.
     - `removeItem(Long userId, Long productId)`:
       - Deletes hash field `productId.toString()` from `cart:{userId}`. Refreshes TTL.
     - `clearCart(Long userId)`:
       - Deletes entire key `cart:{userId}` from Redis.

3. **ProductService Unit Tests (`REQ-OFL-T-101`)**:
   - Unit test class `ProductServiceTest` created in `backend/src/test/java/com/training/starter/service/ProductServiceTest.java` using JUnit 5 & Mockito (`@ExtendWith(MockitoExtension.class)`).
   - Minimum 5 unit tests covering:
     - `create`: Success case returning `ProductResponse`, and duplicate slug throwing `DuplicateResourceException`.
     - `getById`: Success returning `ProductResponse`, and non-existing ID throwing `ResourceNotFoundException`.
     - `getAll`: Paginated product list returning `Page<ProductResponse>`.
     - `update`: Success updating product details, and non-existing ID throwing `ResourceNotFoundException`.
     - `delete`: Soft delete setting `active = false` (never physically deleting entity).
   - 100% pass rate on `mvnw test`.

## Tasks / Subtasks

- [x] Task 1: Create Cart Request / Response DTOs (AC: #1)
  - [x] Create `backend/src/main/java/com/training/starter/dto/response/CartItemResponse.java`.
  - [x] Create `backend/src/main/java/com/training/starter/dto/response/CartResponse.java`.
  - [x] Create `backend/src/main/java/com/training/starter/dto/request/AddToCartRequest.java`.
  - [x] Create `backend/src/main/java/com/training/starter/dto/request/UpdateCartItemRequest.java`.

- [x] Task 2: Implement Redis-Backed `CartService` & `CartServiceImpl` (AC: #2)
  - [x] Create `backend/src/main/java/com/training/starter/service/CartService.java`.
  - [x] Create `backend/src/main/java/com/training/starter/service/impl/CartServiceImpl.java` injecting `RedisTemplate<String, Object>` and `ProductRepository`.
  - [x] Implement `getCart(userId)` with Redis Hash get & TTL refresh.
  - [x] Implement `addItem(userId, request)` with DB product validation, stock check, price calculation, hash put & TTL refresh.
  - [x] Implement `updateQuantity(userId, productId, quantity)` with stock check & TTL refresh.
  - [x] Implement `removeItem(userId, productId)` deleting hash field.
  - [x] Implement `clearCart(userId)` deleting Redis key.

- [x] Task 3: Write `ProductServiceTest` Unit Tests (AC: #3)
  - [x] Create `backend/src/test/java/com/training/starter/service/ProductServiceTest.java` with `@ExtendWith(MockitoExtension.class)`.
  - [x] Implement `create_validRequest_returnsProductResponse()` test.
  - [x] Implement `create_duplicateSlug_throwsDuplicateResourceException()` test.
  - [x] Implement `getById_found_returnsProductResponse()` test.
  - [x] Implement `getById_notFound_throwsResourceNotFoundException()` test.
  - [x] Implement `getAll_paginated_returnsProductPage()` test.
  - [x] Implement `update_validRequest_updatesAndReturns()` test.
  - [x] Implement `delete_existingProduct_setsActiveFalse()` test.

- [x] Task 4: Build & Test Verification (AC: #1, #2, #3)
  - [x] Run `.\mvnw.cmd test` in `backend/` to verify all unit tests pass 100%.

## Dev Notes

- **Architecture & Conventions**:
  - Redis key pattern: `cart:{userId}`.
  - Redis data structure: Hash (`opsForHash()`). Hash key: `productId.toString()`, Hash value: `CartItemResponse`.
  - Redis TTL: `7 DAYS` (`redisTemplate.expire("cart:" + userId, 7, TimeUnit.DAYS)`).
  - Price computation: Always use `BigDecimal` (`unitPrice.multiply(BigDecimal.valueOf(quantity))`).
  - Stock validation: Check `product.getStock() < quantity` and throw `BadRequestException`.
  - Soft delete for products: `product.setActive(false)`.
  - Mockito testing: `@Mock`, `@InjectMocks`, `when()`, `verify()`, `assertThat()`.

- **Source Tree Components Touched / Created**:
  - [NEW] `backend/src/main/java/com/training/starter/dto/response/CartItemResponse.java`
  - [NEW] `backend/src/main/java/com/training/starter/dto/response/CartResponse.java`
  - [NEW] `backend/src/main/java/com/training/starter/dto/request/AddToCartRequest.java`
  - [NEW] `backend/src/main/java/com/training/starter/dto/request/UpdateCartItemRequest.java`
  - [NEW] `backend/src/main/java/com/training/starter/service/CartService.java`
  - [NEW] `backend/src/main/java/com/training/starter/service/impl/CartServiceImpl.java`
  - [NEW] `backend/src/test/java/com/training/starter/service/ProductServiceTest.java`
  - [NEW] `backend/src/test/java/com/training/starter/service/CartServiceTest.java`

### References

- [AGENTS.md Rule 11 (Cart and Redis Rules)](file:///d:/OJT/OrderFlow/AGENTS.md#L121-L148)
- [Task Backlog D-05](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md#L63-L73)
- [Story Backlog H-05](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/stories-hoangnq17.md#L63-L73)
- [Epic Breakdown Story 1.5](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/epics.md#L111-L113)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (Medium)

### Debug Log References

N/A

### Completion Notes List

- Authored `CartItemResponse`, `CartResponse`, `AddToCartRequest`, and `UpdateCartItemRequest` DTOs.
- Implemented `CartServiceImpl` using `RedisTemplate<String, Object>` with Redis Hash data structure (`cart:{userId}`), 7-day TTL expiration, authoritative DB product price validation, stock check, active status check, and quantity updates.
- Authored `ProductServiceTest.java` (10 tests) covering product creation, duplicate slug validation, category existence, pagination, updating, and soft deleting (`active = false`).
- Authored `CartServiceTest.java` (6 tests) verifying Redis cart operations and TTL refresh.
- Verified backend build and unit tests with `mvnw test` (43/43 tests passed 100%).

### File List

- `backend/src/main/java/com/training/starter/dto/response/CartItemResponse.java`
- `backend/src/main/java/com/training/starter/dto/response/CartResponse.java`
- `backend/src/main/java/com/training/starter/dto/request/AddToCartRequest.java`
- `backend/src/main/java/com/training/starter/dto/request/UpdateCartItemRequest.java`
- `backend/src/main/java/com/training/starter/service/CartService.java`
- `backend/src/main/java/com/training/starter/service/impl/CartServiceImpl.java`
- `backend/src/test/java/com/training/starter/service/ProductServiceTest.java`
- `backend/src/test/java/com/training/starter/service/CartServiceTest.java`
- `_bmad-output/implementation-artifacts/1-5-product-unit-tests-and-redis-cart-service.md`
