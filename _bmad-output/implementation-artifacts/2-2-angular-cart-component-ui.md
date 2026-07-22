# Story 2.2: angular-cart-component-ui

Status: done

## Story

As a customer,
I want an Angular Shopping Cart UI component (`CartComponent`) with quantity adjustments, item removal, cart clearing, and dynamic cart badge,
so that I can manage my shopping cart visually with instant feedback before proceeding to checkout.

## Acceptance Criteria

1. **Frontend Cart DTOs & Models (`REQ-OFL-F-201`)**:
   - `CartItem` interface in `frontend/src/app/core/models/cart.model.ts`: `productId`, `productName`, `productSlug`, `unitPrice`, `quantity`, `subtotal`, `imageUrl`.
   - `Cart` interface in `frontend/src/app/core/models/cart.model.ts`: `userId`, `items`, `totalAmount`, `totalItems`.
   - `AddToCartRequest` & `UpdateCartItemRequest` interfaces.

2. **Frontend CartService (`REQ-OFL-F-201`)**:
   - `CartService` created in `frontend/src/app/core/services/cart.service.ts` calling `/api/v1/cart`:
     - `getCart()`: `GET /api/v1/cart`
     - `addToCart(productId, quantity)`: `POST /api/v1/cart/items`
     - `updateQuantity(productId, quantity)`: `PUT /api/v1/cart/items/{productId}`
     - `removeItem(productId)`: `DELETE /api/v1/cart/items/{productId}`
     - `clearCart()`: `DELETE /api/v1/cart`
     - BehaviorSubject / Signal `cartCount$` emitting current `totalItems` for badge display across navbar.

3. **Angular CartComponent & Dynamic UI (`REQ-OFL-F-201`)**:
   - `CartComponent` created in `frontend/src/app/features/cart/cart.component.ts` (standalone component).
   - Card/List view displaying each cart item: thumbnail image, product title, unit price, quantity increment/decrement controls, item subtotal, and delete icon button.
   - Summary sidebar displaying total items count, order total amount, "Clear Cart" button, and "Proceed to Checkout" button.
   - Quantity controls (+/-) trigger instant API calls (`updateQuantity`) and refresh cart state.
   - Remove item button calls `removeItem(productId)` with notification snackbar.
   - Clear cart button displays confirmation dialog before calling `clearCart()`.
   - Empty cart state displays responsive empty cart graphic/icon and "Browse Products" action button navigating to `/products`.

4. **Navigation & Navbar Cart Badge**:
   - Register route `/cart` in `frontend/src/app/app.routes.ts` guarded by `authGuard`.
   - Update `MainLayoutComponent` navigation bar to display shopping cart icon with dynamic MatBadge showing `cart.totalItems`. Clicking cart icon navigates to `/cart`.

## Tasks / Subtasks

- [x] Task 1: Create Frontend Cart Models & CartService (AC: #1, #2)
  - [x] Create `frontend/src/app/core/models/cart.model.ts`.
  - [x] Create `frontend/src/app/core/services/cart.service.ts` with RxJS `BehaviorSubject` for `cart$` and `cartCount$`.

- [x] Task 2: Build Angular `CartComponent` (AC: #3)
  - [x] Create `frontend/src/app/features/cart/cart.component.ts` (standalone component).
  - [x] Implement cart item list layout with Material Card / Table.
  - [x] Implement +/- quantity increment/decrement controls.
  - [x] Implement remove item action with `NotificationService`.
  - [x] Implement clear cart action with `ConfirmDialogComponent`.
  - [x] Implement empty cart view with "Browse Products" button.

- [x] Task 3: Configure Routes & Navigation Badge (AC: #4)
  - [x] Register `/cart` route in `frontend/src/app/app.routes.ts` guarded by `authGuard`.
  - [x] Update `MainLayoutComponent` header navigation with cart icon + `matBadge` displaying `cartCount$`.
  - [x] Add "Add to Cart" button in `ProductListComponent` row / card to quickly add products to cart.

- [x] Task 4: Build Verification (AC: #1, #2, #3, #4)
  - [x] Run `npm run build` in `frontend/` to verify zero TypeScript or template compilation errors.

## Dev Notes

- **Architecture & Conventions**:
  - Angular 17 Standalone Components (`standalone: true`).
  - Reactive state with RxJS `BehaviorSubject` / `Observable`.
  - Material modules: `MatCardModule`, `MatButtonModule`, `MatIconModule`, `MatBadgeModule`, `MatTableModule`, `MatProgressSpinnerModule`, `MatDialogModule`.
  - Use `NotificationService` for user alerts.

- **Source Tree Components Touched / Created**:
  - [NEW] `frontend/src/app/core/models/cart.model.ts`
  - [NEW] `frontend/src/app/core/services/cart.service.ts`
  - [NEW] `frontend/src/app/features/cart/cart.component.ts`
  - [MODIFY] `frontend/src/app/app.routes.ts`
  - [MODIFY] `frontend/src/app/layout/main-layout/main-layout.component.ts`
  - [MODIFY] `frontend/src/app/features/products/product-list/product-list.component.ts`

### References

- [AGENTS.md Rule 16 (Frontend Rules)](file:///d:/OJT/OrderFlow/AGENTS.md#L170-L191)
- [Task Backlog D-07](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md#L89-L99)
- [Epic Breakdown Story 2.2](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/epics.md#L123-L125)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (Medium)

### Debug Log References

N/A

### Completion Notes List

- Authored `cart.model.ts` interfaces (`CartItem`, `Cart`, `AddToCartRequest`, `UpdateCartItemRequest`).
- Created `CartService` in Angular frontend with RxJS `BehaviorSubject` reactive state management for live cart item counts across application layouts.
- Built standalone `CartComponent` (`/cart`) featuring interactive item list, +/- quantity adjustment buttons, subtotal calculation, remove item snackbar notifications, confirm dialog clear cart action, order summary sidebar, and empty cart placeholder state.
- Updated `MainLayoutComponent` to display shopping cart icon with dynamic `matBadge` displaying `cartCount$`.
- Added "Add to Cart" quick action button in `ProductListComponent`.
- Verified frontend build with `npm run build` (Application bundle generation succeeded cleanly with 0 errors).

### File List

- `frontend/src/app/core/models/cart.model.ts`
- `frontend/src/app/core/services/cart.service.ts`
- `frontend/src/app/features/cart/cart.component.ts`
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/layout/main-layout/main-layout.component.ts`
- `frontend/src/app/features/products/product-list/product-list.component.ts`
- `_bmad-output/implementation-artifacts/2-2-angular-cart-component-ui.md`
