---
baseline_commit: a66a04e
---
# Story 1.3: Angular Product Catalog Integration and Navigation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a customer/admin,
I want to view the product catalog table with pagination and navigate via sidebar,
so that I can explore products in the OrderFlow system.

## Acceptance Criteria

1. **Product Models & Category Models (`REQ-OFL-F-103`)**:
   - TypeScript interfaces defined for `CategoryResponse`, `ProductResponse`, `CreateProductRequest`, and `UpdateProductRequest` matching backend DTO definitions.
   - Wraps responses with existing `ApiResponse<T>` and `PageResponse<T>` models.

2. **Angular Product & Category Services (`REQ-OFL-F-103`)**:
   - `ProductService` created in `frontend/src/app/core/services/product.service.ts` using `@Injectable({ providedIn: 'root' })`.
   - `CategoryService` created in `frontend/src/app/core/services/category.service.ts` using `@Injectable({ providedIn: 'root' })`.
   - Methods implemented:
     - `getProducts(page: number, size: number, sort?: string)`: calls `GET /api/v1/products` returning `Observable<ApiResponse<PageResponse<ProductResponse>>>`.
     - `getProductById(id: number)`: calls `GET /api/v1/products/{id}` returning `Observable<ApiResponse<ProductResponse>>`.
     - `createProduct(request: CreateProductRequest)`: calls `POST /api/v1/products`.
     - `updateProduct(id: number, request: UpdateProductRequest)`: calls `PUT /api/v1/products/{id}`.
     - `deleteProduct(id: number)`: calls `DELETE /api/v1/products/{id}` (soft delete).
     - `getCategories()`: calls `GET /api/v1/categories` returning `Observable<ApiResponse<CategoryResponse[]>>`.
   - Sends valid HTTP requests using Angular `HttpClient`.
   - `JwtInterceptor` automatically attaches bearer token to request headers.

3. **Angular Product List Component (`REQ-OFL-F-103`, `REQ-OFL-F-104`)**:
   - Standalone component created in `frontend/src/app/features/products/product-list/product-list.component.ts`.
   - Renders product table with columns: ID, Image, Name, Category, Price, Stock, Status, Actions.
   - Implements Angular Material Table (`MatTable`) and Paginator (`MatPaginator`) for server-side pagination.
   - Includes visual chips/badges for active/inactive status and formatted currency display.
   - Loading state handled cleanly with spinner/progress indicator and error feedback via `NotificationService` (MatSnackBar).

4. **Router Configuration & Sidebar Navigation (`REQ-OFL-F-104`)**:
   - Configured route path `products` under child routes of `MainLayoutComponent` in `app.routes.ts`.
   - Added `Products` navigation item (`<a mat-list-item routerLink="/products" routerLinkActive="active">`) in `MainLayoutComponent` sidebar menu with icon `inventory`.
   - Clicking navigation item routes smoothly to `/products` with active route styling.

## Tasks / Subtasks

- [x] Task 1: Define TypeScript Models & Interfaces (`REQ-OFL-F-103`) (AC: #1)
  - [x] Create `frontend/src/app/core/models/category.model.ts` (`CategoryResponse`, `CreateCategoryRequest`).
  - [x] Create `frontend/src/app/core/models/product.model.ts` (`ProductResponse`, `CreateProductRequest`, `UpdateProductRequest`).

- [x] Task 2: Implement `ProductService` & `CategoryService` (`REQ-OFL-F-103`) (AC: #2)
  - [x] Create `frontend/src/app/core/services/product.service.ts` using `@Injectable({ providedIn: 'root' })`.
  - [x] Create `frontend/src/app/core/services/category.service.ts` using `@Injectable({ providedIn: 'root' })`.
  - [x] Implement RxJS HTTP client calls to `/api/v1/products` and `/api/v1/categories`.
  - [x] Support pagination parameters (`page`, `size`, `sort`).

- [x] Task 3: Implement `ProductListComponent` (`REQ-OFL-F-103`) (AC: #3)
  - [x] Create `frontend/src/app/features/products/product-list/product-list.component.ts` (standalone component).
  - [x] Implement `MatTable`, `MatPaginator`, `MatSort`, `MatChip` for active/inactive badge, `MatButton` for actions.
  - [x] Integrate server-side pagination handling `PageEvent` from `MatPaginator`.
  - [x] Add delete confirmation dialog/action triggering `deleteProduct(id)`.

- [x] Task 4: Configure Router and Update Sidebar Navigation (`REQ-OFL-F-104`) (AC: #4)
  - [x] Add `{ path: 'products', loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent) }` to `app.routes.ts`.
  - [x] Add `Products` link with icon `inventory` to `MainLayoutComponent` sidebar nav list.

- [x] Task 5: Build Verification & Testing (AC: #1, #2, #3, #4)
  - [x] Run `npm run build` in `frontend` directory to ensure zero TypeScript/Angular compilation errors.

### Review Findings

- [x] [Review][Patch] Adjust pageIndex on last item deletion [product-list.component.ts:117]
- [x] [Review][Patch] Add image error fallback handler [product-list.component.ts:32]

## Dev Notes

### Architecture & Technical Guardrails

1. **Angular 17 Standalone Components**:
   - Use Standalone components (`standalone: true`).
   - Explicitly list imported Angular Material modules (`MatTableModule`, `MatPaginatorModule`, `MatButtonModule`, `MatIconModule`, `MatChipsModule`, `MatProgressSpinnerModule`) and RxJS operators in `imports`.

2. **HTTP Communication & API Services**:
   - Do not construct raw URLs in components. Base API URL comes from `environment.apiUrl` (`/api/v1`).
   - Use `HttpClient` and RxJS operators (`catchError`, `tap`, `map`).
   - JWT tokens are automatically attached by `jwt.interceptor.ts`.

3. **Backend API Contract Alignment**:
   - `GET /api/v1/products?page={page}&size={size}&sort={sort}` -> Returns `ApiResponse<PageResponse<ProductResponse>>`.
   - `GET /api/v1/categories` -> Returns `ApiResponse<List<CategoryResponse>>`.
   - `DELETE /api/v1/products/{id}` -> Returns `ApiResponse<Void>`.

4. **UI Design & UX Rules**:
   - Follow Angular Material design patterns used in starter codebase (e.g. `MainLayoutComponent`, `UserListComponent`).
   - Use `MatTable` for catalog, `MatPaginator` for pagination, `MatSnackBar` (via `NotificationService`) for user notifications.
   - Price display: Format as currency (`$19.99` or using Angular `CurrencyPipe`).

5. **Security Rules**:
   - User routes protected by `authGuard`.
   - Admin action buttons (e.g. delete product) can check user role or be hidden/protected if current user is not admin.

### Source Tree Components

- `frontend/src/app/core/models/category.model.ts` [NEW]
- `frontend/src/app/core/models/product.model.ts` [NEW]
- `frontend/src/app/core/services/product.service.ts` [NEW]
- `frontend/src/app/core/services/category.service.ts` [NEW]
- `frontend/src/app/features/products/product-list/product-list.component.ts` [NEW]
- `frontend/src/app/app.routes.ts` [MODIFY]
- `frontend/src/app/layout/main-layout/main-layout.component.ts` [MODIFY]

### Previous Story Intelligence

- **Story 1.1**: Created Category and Product entities & base backend services.
- **Story 1.2**: Created backend controllers (`ProductController`, `CategoryController`) returning `ApiResponse<PageResponse<ProductResponse>>` and `ApiResponse<List<CategoryResponse>>`.
- **Learnings**: Backend pagination uses 0-based page indexing (`page=0, size=10`). Ensure Angular `MatPaginator` pageIndex (0-based) aligns with backend page parameter.

### References

- [AGENTS.md rules](file:///d:/Code/OrderFlow/AGENTS.md)
- [prd.md](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/prd-orderflow/prd.md)
- [stories-hoangnq17.md (Story H-03)](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/stories-hoangnq17.md#L37-L48)
- [epics.md (Story 1.3)](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/epics.md#L105-L107)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (High)

### Debug Log References

N/A

### Completion Notes List

- Defined TypeScript models (`CategoryResponse`, `ProductResponse`, `CreateProductRequest`, `UpdateProductRequest`).
- Created `CategoryService` and `ProductService` for REST API communication.
- Implemented `ProductListComponent` with Angular Material Table, Paginator, Chips, Spinner, and ConfirmDialog integration.
- Registered `/products` route in `app.routes.ts` and added sidebar navigation link in `MainLayoutComponent`.
- Verified Angular build (`npm run build`) succeeded with 0 compilation errors.

### File List

- `frontend/src/app/core/models/category.model.ts`
- `frontend/src/app/core/models/product.model.ts`
- `frontend/src/app/core/services/category.service.ts`
- `frontend/src/app/core/services/product.service.ts`
- `frontend/src/app/features/products/product-list/product-list.component.ts`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/layout/main-layout/main-layout.component.ts`

### Change Log

- Implemented Angular Product Catalog Integration & Navigation (Date: 2026-07-22)
