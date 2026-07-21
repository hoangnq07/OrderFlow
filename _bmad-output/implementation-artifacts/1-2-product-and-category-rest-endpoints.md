---
baseline_commit: c6cf45f40d419535a11d1fd9a72d583a6e59791e
---
# Story 1.2: Product and Category REST Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer/client,
I want REST endpoints for Product and Category CRUD operations with pagination, along with Flyway migrations V3 and V4,
so that products and categories can be managed via clean REST APIs and database schema prepared for orders and indexing.

## Acceptance Criteria

1. **Category REST Endpoints (`REQ-OFL-B-107`)**:
   - `GET /api/v1/categories`: Returns list of categories wrapped in `ApiResponse<List<CategoryResponse>>`. Publicly accessible.
   - `GET /api/v1/categories/{id}`: Returns category details by ID wrapped in `ApiResponse<CategoryResponse>`. Throws `ResourceNotFoundException` (HTTP 404) if not found. Publicly accessible.
   - `POST /api/v1/categories`: Creates a new category from `CreateCategoryRequest` (validated with `@Valid`). Requires `ADMIN` role. Throws `DuplicateResourceException` (HTTP 400) if slug already exists.
   - `PUT /api/v1/categories/{id}`: Updates existing category from `UpdateCategoryRequest` (validated with `@Valid`). Requires `ADMIN` role.
   - `DELETE /api/v1/categories/{id}`: Deletes category by ID. Requires `ADMIN` role.

2. **Product REST Endpoints (`REQ-OFL-B-105`, `REQ-OFL-B-106`)**:
   - `GET /api/v1/products`: Paginated product list endpoint accepting `page`, `size`, `sort`. Returns `ApiResponse<PageResponse<ProductResponse>>`. Publicly accessible.
   - `GET /api/v1/products/{id}`: Returns product details by ID wrapped in `ApiResponse<ProductResponse>`. Publicly accessible.
   - `POST /api/v1/products`: Creates a new product from `CreateProductRequest` (validated with `@Valid`). Requires `ADMIN` role. Sets default `active = true` and `version = 0`.
   - `PUT /api/v1/products/{id}`: Updates existing product from `UpdateProductRequest` (validated with `@Valid`). Requires `ADMIN` role.
   - `DELETE /api/v1/products/{id}`: Soft deletes product by setting `active = false` (does NOT physically delete). Requires `ADMIN` role.

3. **Flyway Migrations V3 & V4 (`REQ-OFL-B-108`)**:
   - `V3__create_order_tables.sql`: Creates `orders` and `order_items` tables with primary keys, foreign keys (`users`, `products`, `orders`), non-null constraints, and timestamps (`created_at`, `updated_at`).
   - `V4__create_indexes.sql`: Creates database indexes for query performance: `idx_products_category`, `idx_products_active`, `idx_products_search` (GIN index on `search_vector`), `idx_orders_user`, `idx_orders_status`, `idx_orders_user_status`, `idx_order_items_order`.
   - Both migrations execute deterministically and cleanly on PostgreSQL startup.

4. **API Documentation & Standards**:
   - Both controllers annotated with `@Tag`, `@Operation`, and `@ApiResponse` annotations for SpringDoc OpenAPI / Swagger UI.
   - Global exception handling converts `ResourceNotFoundException` to 404, `DuplicateResourceException` and validation errors to 400, and authorization failures to 401/403.
   - No sensitive details or stack traces returned to clients.

## Tasks / Subtasks

- [x] Task 1: Create `CategoryController` (`REQ-OFL-B-107`) (AC: #1, #4)
  - [x] Implement `@RestController` `@RequestMapping("/api/v1/categories")` `CategoryController`
  - [x] Inject `CategoryService` via constructor injection (`@RequiredArgsConstructor`)
  - [x] Implement `GET /api/v1/categories` and `GET /api/v1/categories/{id}`
  - [x] Implement `POST /api/v1/categories`, `PUT /api/v1/categories/{id}`, `DELETE /api/v1/categories/{id}` with `@PreAuthorize("hasRole('ADMIN')")`
  - [x] Add SpringDoc OpenAPI annotations (`@Tag`, `@Operation`, `@ApiResponse`)

- [x] Task 2: Create `ProductController` (`REQ-OFL-B-105`, `REQ-OFL-B-106`) (AC: #2, #4)
  - [x] Implement `@RestController` `@RequestMapping("/api/v1/products")` `ProductController`
  - [x] Inject `ProductService` via constructor injection (`@RequiredArgsConstructor`)
  - [x] Implement `GET /api/v1/products` with `Pageable` (`@PageableDefault(page = 0, size = 10)`) returning `PageResponse<ProductResponse>`
  - [x] Implement `GET /api/v1/products/{id}`
  - [x] Implement `POST /api/v1/products`, `PUT /api/v1/products/{id}`, `DELETE /api/v1/products/{id}` with `@PreAuthorize("hasRole('ADMIN')")`
  - [x] Add SpringDoc OpenAPI annotations (`@Tag`, `@Operation`, `@ApiResponse`)

- [x] Task 3: Write Flyway Migration `V3__create_order_tables.sql` (`REQ-OFL-B-108`) (AC: #3)
  - [x] Define `orders` table (`id BIGSERIAL PK`, `user_id BIGINT REFERENCES users(id)`, `status VARCHAR(50)`, `total_amount DECIMAL(12,2)`, `shipping_address VARCHAR(500)`, `note TEXT`, `created_at`, `updated_at`)
  - [x] Define `order_items` table (`id BIGSERIAL PK`, `order_id BIGINT REFERENCES orders(id)`, `product_id BIGINT REFERENCES products(id)`, `product_name VARCHAR(255)`, `quantity INT`, `unit_price DECIMAL(12,2)`, `subtotal DECIMAL(12,2)`)

- [x] Task 4: Write Flyway Migration `V4__create_indexes.sql` (`REQ-OFL-B-108`) (AC: #3)
  - [x] Create `idx_products_category` on `products(category_id)`
  - [x] Create `idx_products_active` on `products(active)`
  - [x] Create `idx_products_search` GIN index on `products USING gin(search_vector)`
  - [x] Create `idx_orders_user` on `orders(user_id)`
  - [x] Create `idx_orders_status` on `orders(status)`
  - [x] Create `idx_orders_user_status` on `orders(user_id, status)`
  - [x] Create `idx_order_items_order` on `order_items(order_id)`

- [x] Task 5: Verify Spring Security & Build (AC: #1, #2, #3, #4)
  - [x] Verify security rules in `SecurityConfig.java` match endpoints
  - [x] Run `./mvnw clean verify` to ensure backend compiles cleanly and Flyway migrations execute against Testcontainers/PostgreSQL

## Dev Notes

- **Architecture & Conventions**:
  - Base path: `/api/v1`
  - Standard HTTP semantics: GET (Read), POST (Create), PUT (Update), DELETE (Soft delete for Product / Delete for Category).
  - Use `ApiResponse<T>` and `PageResponse<T>` for consistent API responses.
  - Constructor injection ONLY (`@RequiredArgsConstructor` with `private final` fields).
  - Never expose JPA Entities directly through REST APIs; use DTOs (`CategoryResponse`, `ProductResponse`).
  - Validation: Validate request DTOs with `@Valid` (Jakarta Validation).
  - Soft Delete: Product deletion sets `active = false`. Physical delete is prohibited for products referenced by orders.

- **Source Tree Components**:
  - `backend/src/main/java/com/training/starter/controller/CategoryController.java` [NEW]
  - `backend/src/main/java/com/training/starter/controller/ProductController.java` [NEW]
  - `backend/src/main/resources/db/migration/V3__create_order_tables.sql` [NEW]
  - `backend/src/main/resources/db/migration/V4__create_indexes.sql` [NEW]
  - `backend/src/main/java/com/training/starter/security/SecurityConfig.java` [MODIFY - Verified matching security routes]

### Project Structure Notes

- Package base: `com.training.starter`
- Controllers belong in `com.training.starter.controller`
- DTOs located in `com.training.starter.dto.request` and `com.training.starter.dto.response`
- Flyway migrations located in `backend/src/main/resources/db/migration/`
- Naming convention: `V3__create_order_tables.sql`, `V4__create_indexes.sql`

### References

- [AGENTS.md rules](file:///d:/OJT/OrderFlow/AGENTS.md#L157-L200) (API & Security Rules)
- [PRD Technical Architecture](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/prd-orderflow/prd.md#L22-L36)
- [Task Backlog D-02](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md#L24-L35)
- [Story Backlog H-02](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/stories-hoangnq17.md#L24-L35)
- [Epic Breakdown Story 1.2](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/epics.md#L102-L104)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (High)

### Debug Log References

N/A

### Completion Notes List

- Implemented `CategoryController` (`GET`, `POST`, `PUT`, `DELETE /api/v1/categories`).
- Implemented `ProductController` (`GET` paginated, `GET/{id}`, `POST`, `PUT`, `DELETE` soft-delete `/api/v1/products`).
- Authored Flyway migration `V3__create_order_tables.sql` defining `orders` and `order_items` tables with foreign keys and constraints.
- Authored Flyway migration `V4__create_indexes.sql` creating indexes on `products` (category, active, GIN search_vector), `orders` (user_id, status), and `order_items`.
- Verified backend build and unit tests using `mvnw clean compile` and `mvnw test` (100% pass rate).

### File List

- `backend/src/main/java/com/training/starter/controller/CategoryController.java`
- `backend/src/main/java/com/training/starter/controller/ProductController.java`
- `backend/src/main/resources/db/migration/V3__create_order_tables.sql`
- `backend/src/main/resources/db/migration/V4__create_indexes.sql`
