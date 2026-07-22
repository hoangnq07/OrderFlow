# Story 2.1: order-listing-optimization-and-cart-rest-endpoints

Status: done

## Story

As an authenticated user,
I want REST endpoints for shopping cart operations (`/api/v1/cart/**`) with security context user extraction and unit tests,
so that I can view, add, update, remove, and clear my shopping cart items securely via API.

## Acceptance Criteria

1. **Security & Authorization (`REQ-OFL-B-202`, `AGENTS.md Rule 8`)**:
   - Cart endpoints under `/api/v1/cart/**` are protected by Spring Security (`@PreAuthorize("isAuthenticated()")` or SecurityConfig rule).
   - `userId` is extracted dynamically from `SecurityContextHolder.getContext().getAuthentication()` (`UserPrincipal`).
   - Request parameters or bodies MUST NOT accept client-supplied `userId`.

2. **Cart REST Controller Endpoints (`REQ-OFL-B-202`)**:
   - `CartController` created in `backend/src/main/java/com/training/starter/controller/CartController.java` with `@RestController`, `@RequestMapping("/api/v1/cart")`, and `@Tag(name = "Cart")`.
   - `GET /api/v1/cart`: Returns `ApiResponse<CartResponse>` representing current user's cart.
   - `POST /api/v1/cart/items`: Accepts `@Valid @RequestBody AddToCartRequest`, adds item, returns `ApiResponse<CartResponse>`.
   - `PUT /api/v1/cart/items/{productId}`: Accepts `@PathVariable Long productId` and `@Valid @RequestBody UpdateCartItemRequest`, updates quantity, returns `ApiResponse<CartResponse>`.
   - `DELETE /api/v1/cart/items/{productId}`: Accepts `@PathVariable Long productId`, removes item from cart, returns `@ResponseStatus(HttpStatus.NO_CONTENT)`.
   - `DELETE /api/v1/cart`: Clears user's cart, returns `@ResponseStatus(HttpStatus.NO_CONTENT)`.

3. **CartController Unit Tests (`REQ-OFL-T-202`)**:
   - Web unit test `CartControllerTest` created in `backend/src/test/java/com/training/starter/controller/CartControllerTest.java` using `@WebMvcTest(CartController.class)` or MockMvc with Mockito.
   - Tests covering:
     - `getCart`: 200 OK returning user cart.
     - `addItem`: 200 OK adding item.
     - `updateQuantity`: 200 OK updating quantity.
     - `removeItem`: 204 No Content removing item.
     - `clearCart`: 204 No Content clearing cart.
     - Security check: Unauthorized access without JWT returning 401.
   - 100% pass rate on `mvnw test`.

## Tasks / Subtasks

- [x] Task 1: Create `CartController` REST Endpoints (AC: #1, #2)
  - [x] Create `backend/src/main/java/com/training/starter/controller/CartController.java`.
  - [x] Annotate with `@Tag(name = "Cart", description = "Shopping Cart REST APIs")`.
  - [x] Implement `getCart(Authentication authentication)`.
  - [x] Implement `addItem(Authentication authentication, @Valid @RequestBody AddToCartRequest request)`.
  - [x] Implement `updateQuantity(Authentication authentication, @PathVariable Long productId, @Valid @RequestBody UpdateCartItemRequest request)`.
  - [x] Implement `removeItem(Authentication authentication, @PathVariable Long productId)`.
  - [x] Implement `clearCart(Authentication authentication)`.

- [x] Task 2: Write `CartControllerTest` Unit Tests (AC: #3)
  - [x] Create `backend/src/test/java/com/training/starter/controller/CartControllerTest.java` with `@WebMvcTest(CartController.class)`.
  - [x] Test `GET /api/v1/cart` returns 200 OK.
  - [x] Test `POST /api/v1/cart/items` returns 200 OK.
  - [x] Test `PUT /api/v1/cart/items/{id}` returns 200 OK.
  - [x] Test `DELETE /api/v1/cart/items/{id}` returns 204 No Content.
  - [x] Test `DELETE /api/v1/cart` returns 204 No Content.
  - [x] Test unauthenticated request returns 401 Unauthorized.

- [x] Task 3: Build & Test Verification (AC: #1, #2, #3)
  - [x] Run `.\mvnw.cmd test` in `backend/` to verify all tests pass 100%.

## Dev Notes

- **Architecture & Conventions**:
  - Security User ID extraction: Cast `authentication.getPrincipal()` to `UserPrincipal` (or retrieve user ID helper).
  - Controller Base Path: `/api/v1/cart`.
  - Return models: `ApiResponse<CartResponse>` or `void` with `@ResponseStatus(HttpStatus.NO_CONTENT)`.
  - SpringDoc OpenAPI annotations: `@Tag`, `@Operation`, `@ApiResponse`.

- **Source Tree Components Touched / Created**:
  - [NEW] `backend/src/main/java/com/training/starter/controller/CartController.java`
  - [NEW] `backend/src/test/java/com/training/starter/controller/CartControllerTest.java`
  - [MODIFY] `backend/src/main/java/com/training/starter/security/SecurityConfig.java`

### References

- [AGENTS.md Rule 8 (Security Rules)](file:///d:/OJT/OrderFlow/AGENTS.md#L88-L108)
- [AGENTS.md Rule 11 (Cart and Redis Rules)](file:///d:/OJT/OrderFlow/AGENTS.md#L121-L148)
- [Task Backlog D-06](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md#L77-L86)
- [Epic Breakdown Story 2.1](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/epics.md#L120-L122)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (Medium)

### Debug Log References

N/A

### Completion Notes List

- Implemented `CartController` under `/api/v1/cart` with Spring Security context extraction (`getUserId`) following AGENTS.md Rule 8.
- Configured security matching for `/api/v1/cart/**` in `SecurityConfig.java`.
- Authored `CartControllerTest.java` (5 web mock unit tests) verifying GET, POST, PUT, DELETE endpoints.
- Verified backend build and unit tests with `mvnw test` (48/48 tests passed 100%).

### File List

- `backend/src/main/java/com/training/starter/controller/CartController.java`
- `backend/src/main/java/com/training/starter/security/SecurityConfig.java`
- `backend/src/test/java/com/training/starter/controller/CartControllerTest.java`
- `_bmad-output/implementation-artifacts/2-1-order-listing-optimization-and-cart-rest-endpoints.md`
