---
baseline_commit: c6cf45f40d419535a11d1fd9a72d583a6e59791e
---
# Story 1.2: Product and Category REST Endpoints

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer/client,
I want REST endpoints for Product and Category CRUD operations with pagination,
so that products and categories can be retrieved and managed.

## Acceptance Criteria

1. Endpoint `GET /api/v1/products` returns `PageResponse<ProductResponse>` with status HTTP 200 and matches standard pagination parameters (`page`, `size`, `sortBy`, `sortDir`).
2. CRUD operations for products (GET by ID, POST, PUT, DELETE) function correctly with standard validation, error handling, and soft delete (`active = false` on DELETE).
3. Endpoint `GET /api/v1/categories` lists all categories (returns `ApiResponse<List<CategoryResponse>>`).
4. Endpoint `POST /api/v1/categories` allows Admin to create a category, enforcing unique name/slug constraints.
5. Security is enforced: public read access for GET endpoints; WRITE access (POST, PUT, DELETE) requires role `ADMIN`.

## Tasks / Subtasks

- [x] Implement `ProductController` with standard endpoints. (AC: 1, 2, 5)
  - [x] Implement `GET /api/v1/products` using `ProductService.getAll(Pageable)`.
  - [x] Implement `GET /api/v1/products/{id}` using `ProductService.getById(Long)`.
  - [x] Implement `POST /api/v1/products` using `@Valid` request body and `ProductService.create(CreateProductRequest)`.
  - [x] Implement `PUT /api/v1/products/{id}` using `@Valid` request body and `ProductService.update(Long, UpdateProductRequest)`.
  - [x] Implement `DELETE /api/v1/products/{id}` using `ProductService.delete(Long)`.
- [x] Implement `CategoryController` with standard endpoints. (AC: 3, 4, 5)
  - [x] Implement `GET /api/v1/categories` using `CategoryService.getAll()`.
  - [x] Implement `POST /api/v1/categories` using `@Valid` request body and `CategoryService.create(CreateCategoryRequest)`.
- [x] Verify endpoints with Swagger/OpenAPI documentation. (AC: 1, 2, 3, 4)

## Dev Notes

- **Java Version**: Java 17.
- **Dependency Injection**: Constructor injection is enforced (use `@RequiredArgsConstructor` on controllers, no field injection).
- **Data Transfer Objects (DTOs)**: Controllers must accept request DTOs (`CreateProductRequest`, `UpdateProductRequest`, etc.) and return response DTOs wrapped in `ApiResponse` or `PageResponse`.
- **Response Structure**:
  - Single resources: `ApiResponse<ProductResponse>` or `ApiResponse<CategoryResponse>`.
  - Paginated lists: `ApiResponse<PageResponse<ProductResponse>>`.
  - Non-paginated lists: `ApiResponse<List<CategoryResponse>>`.
  - Deletion: `void` with `@ResponseStatus(HttpStatus.NO_CONTENT)`.
- **Security Rules**:
  - GET `/api/v1/products/**` and `/api/v1/categories/**` must be public (already configured in `SecurityConfig.java`).
  - POST/PUT/DELETE for both products and categories require role `ADMIN` (already configured in `SecurityConfig.java`).
- **Validation & Exception Handling**:
  - Request payloads must be validated using `@Valid` and `@RequestBody`.
  - Constraints defined in DTOs (e.g. name length, non-negative price/stock) must be enforced.
  - Validation exceptions, resource not found, or duplicates are handled by `GlobalExceptionHandler`.

### Project Structure Notes

- Controllers package: `com.training.starter.controller`
- File locations:
  - `ProductController.java` in [ProductController.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/controller/ProductController.java)
  - `CategoryController.java` in [CategoryController.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/controller/CategoryController.java)

### Previous Story Intelligence

- Entity configurations, database schemas, and service logic implemented in Story 1.1 are working.
- Ensure constructor injection is used exclusively in controllers.
- Use MapStruct mappers (configured in Story 1.1) inside the service implementation; the controller only interacts with the service interface.

### Git Intelligence

- Story 1.1 was completed and merged in commit `5c06616` (`feat(product): implement category and product entities and services`).
- The security configuration is already complete in `SecurityConfig.java`.

### References

- [Project 1 - OrderFlow.md](file:///d:/Code/OrderFlow/Project%201%20-%20OrderFlow.md)
- [AGENTS.md](file:///d:/Code/OrderFlow/AGENTS.md)
- [prd.md](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/prd-orderflow/prd.md)
- [stories-hoangnq17.md](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/stories-hoangnq17.md)
- [tasks-duandh3.md](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (High)

### Debug Log References

- N/A

### Completion Notes List

- ProductController and CategoryController successfully implemented under package `com.training.starter.controller`.
- Mapped all product and category endpoints as specified in the acceptance criteria.
- Tested using mock MVC unit tests for pagination, input validation, success scenarios, and soft deletes.
- Clean verification check via Maven compiles, packages, and tests successfully.

### File List

- [ProductController.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/controller/ProductController.java)
- [CategoryController.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/controller/CategoryController.java)
- [ProductControllerTest.java](file:///d:/Code/OrderFlow/backend/src/test/java/com/training/starter/controller/ProductControllerTest.java)
- [CategoryControllerTest.java](file:///d:/Code/OrderFlow/backend/src/test/java/com/training/starter/controller/CategoryControllerTest.java)
