---
tags:
  - training
  - project
  - orderflow
  - nhom-1
created: 2026-07-19
updated: 2026-07-19
---

# Project 1 — OrderFlow (E-commerce Order Processing)

**Team**: 1 (2 people)
**Domain**: E-commerce — order processing from creation to fulfillment
**Prefix**: OFL
**Repo**: https://github.com/TuanHoAnh/OrderFlow
**PIC**: HoangNQ17 + DuanDH3


## Business Description

E-commerce order processing system:
- Product catalog management
- Shopping cart (Redis-based)
- Order placement with stock locking (pessimistic lock)
- Mock payment processing
- Order notification via email (MailHog)

## Database Schema

### Core Tables

```sql
-- V2__create_product_tables.sql (V1 is users from starter)
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category_id BIGINT REFERENCES categories(id),
    image_url VARCHAR(500),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    version BIGINT NOT NULL DEFAULT 0,
    search_vector TSVECTOR,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- V3__create_order_tables.sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(12,2) NOT NULL,
    shipping_address TEXT,
    note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

-- V4__create_indexes.sql
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active) WHERE active = TRUE;
CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
```

### Order Status Flow
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
                                              → CANCELLED
         → CANCELLED (from PENDING)
```

## API Endpoints

### Products (Public + Admin)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/products` | No | List products (paginated, cached) |
| GET | `/api/v1/products/{id}` | No | Product detail (cached) |
| GET | `/api/v1/products/search?q=` | No | Full-text search |
| POST | `/api/v1/products` | ADMIN | Create product |
| PUT | `/api/v1/products/{id}` | ADMIN | Update product → invalidate cache |
| DELETE | `/api/v1/products/{id}` | ADMIN | Soft delete product |

### Cart (Redis-based)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/cart` | USER | Get cart items |
| POST | `/api/v1/cart/items` | USER | Add item to cart |
| PUT | `/api/v1/cart/items/{productId}` | USER | Update quantity |
| DELETE | `/api/v1/cart/items/{productId}` | USER | Remove item |
| DELETE | `/api/v1/cart` | USER | Clear cart |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/orders` | USER | Create order from cart |
| GET | `/api/v1/orders` | USER | List my orders (paginated) |
| GET | `/api/v1/orders/{id}` | USER | Order detail |
| PUT | `/api/v1/orders/{id}/cancel` | USER | Cancel order |
| GET | `/api/v1/admin/orders` | ADMIN | List all orders (filtered) |
| PUT | `/api/v1/admin/orders/{id}/status` | ADMIN | Update order status |

## Challenge Details

### DB: Pessimistic Lock Stock

```java
@Transactional
public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
    // 1. Get cart items from Redis
    // 2. Lock products (PESSIMISTIC_WRITE) — sort by ID to prevent deadlock
    // 3. Validate stock availability
    // 4. Decrease stock
    // 5. Create order + items
    // 6. Clear cart
    // 7. Publish OrderCreatedEvent
}
```

### Redis: Cart Cache + Rate Limit

**Cart** stored as Redis Hash:
```
Key: cart:{userId}
Field: {productId}
Value: {quantity, productName, unitPrice}
TTL: 7 days
```

**Rate Limiting**: 100 requests/minute per IP using Redis INCR + EXPIRE.

### RabbitMQ: Order Async Flow

```
OrderCreatedEvent
  → order.exchange (topic)
    → payment.process.queue → PaymentConsumer
        → PaymentCompletedEvent
          → notification.queue → NotificationConsumer → Email (MailHog)
    → inventory.update.queue → InventoryConsumer (optional log)
```

| Exchange | Type | Queue | Routing Key |
|----------|------|-------|-------------|
| order.exchange | Topic | payment.process.queue | order.created |
| order.exchange | Topic | order.notification.queue | order.# |
| payment.exchange | Direct | notification.email.queue | payment.completed |

---

## Weekly Requirements

### Week 1 Requirements

#### Backend
- [ ] REQ-OFL-B-101: Create `Category` entity with fields: id, name, slug. Add Flyway migration V2.
- [ ] REQ-OFL-B-102: Create `Product` entity with fields: id, name, slug, description, price (BigDecimal), stock (int), categoryId, imageUrl, active, version, searchVector. Add to V2 migration.
- [ ] REQ-OFL-B-103: Implement `CategoryService` with CRUD operations. Use MapStruct for entity↔DTO mapping.
- [ ] REQ-OFL-B-104: Implement `ProductService` with CRUD operations. Use MapStruct for entity↔DTO mapping. Include soft delete (set active=false).
- [ ] REQ-OFL-B-105: Create `GET /api/v1/products` with pagination (page, size, sortBy params). Return `PageResponse<ProductResponse>`.
- [ ] REQ-OFL-B-106: Create `GET /api/v1/products/{id}`, `POST /api/v1/products`, `PUT /api/v1/products/{id}`, `DELETE /api/v1/products/{id}` endpoints.
- [ ] REQ-OFL-B-107: Create `GET /api/v1/categories` (list) and `POST /api/v1/categories` (create) endpoints.
- [ ] REQ-OFL-B-108: Add Flyway migrations V3 for orders and order_items tables, V4 for indexes.

#### Angular
- [ ] REQ-OFL-F-101: Create `ProductListComponent` displaying products in a table with columns: Name, Price, Stock, Category, Status. Include pagination.
- [ ] REQ-OFL-F-102: Create `ProductFormComponent` with reactive form for create/edit product. Fields: name, description, price, stock, category (dropdown), active toggle.
- [ ] REQ-OFL-F-103: Add product routes to app routing. Wire up navigation in sidebar.
- [ ] REQ-OFL-F-104: Create `ProductService` (Angular) calling backend CRUD endpoints with proper error handling.

#### Testing
- [ ] REQ-OFL-T-101: Write unit tests for `ProductService`: create (valid + duplicate slug), getById (found + not found), update, delete. Min 5 tests.
- [ ] REQ-OFL-T-102: Write unit tests for `CategoryService`: create, getAll, getById. Min 3 tests.
- [ ] REQ-OFL-T-103: Verify Swagger UI shows all product and category endpoints correctly.

### Week 2 Requirements

#### Backend
- [ ] REQ-OFL-B-201: Implement `CartService` using Redis Hash. Operations: addItem, updateQuantity, removeItem, getCart, clearCart. Key pattern: `cart:{userId}`, TTL 7 days.
- [ ] REQ-OFL-B-202: Create cart REST endpoints: `GET /api/v1/cart`, `POST /api/v1/cart/items`, `PUT /api/v1/cart/items/{productId}`, `DELETE /api/v1/cart/items/{productId}`, `DELETE /api/v1/cart`.
- [ ] REQ-OFL-B-203: Implement `OrderService.createOrder()` with pessimistic lock on product stock. Sort product IDs before locking to prevent deadlock. Validate stock, decrease stock, create order + items, clear cart, publish event.
- [ ] REQ-OFL-B-204: Create order REST endpoints: `POST /api/v1/orders`, `GET /api/v1/orders` (my orders, paginated), `GET /api/v1/orders/{id}`, `PUT /api/v1/orders/{id}/cancel`.
- [ ] REQ-OFL-B-205: Fix N+1 query on order listing — use `JOIN FETCH` or `@EntityGraph` to load order items eagerly.
- [ ] REQ-OFL-B-206: Implement full-text search on products using PostgreSQL `tsvector`. Create `GET /api/v1/products/search?q=` endpoint.
- [ ] REQ-OFL-B-207: Set up RabbitMQ exchanges and queues: `order.exchange` (topic), `payment.process.queue`, `order.notification.queue`. Create `OrderEventPublisher` to publish `OrderCreatedEvent`.
- [ ] REQ-OFL-B-208: Implement `PaymentConsumer` to receive `OrderCreatedEvent`, simulate payment processing (Thread.sleep), then publish `PaymentCompletedEvent`.
- [ ] REQ-OFL-B-209: Implement `NotificationConsumer` to receive `PaymentCompletedEvent` and send order confirmation email via MailHog.
- [ ] REQ-OFL-B-210: Implement product cache using Redis. Cache product detail on `getById()` with 30-min TTL. Invalidate on update/delete.

#### Angular
- [ ] REQ-OFL-F-201: Create `CartComponent` showing cart items with quantity controls, remove button, and total price. Wire to `CartService` calling backend.
- [ ] REQ-OFL-F-202: Create `OrderListComponent` showing user's orders with columns: Order ID, Date, Status, Total, Actions (view detail).
- [ ] REQ-OFL-F-203: Create `OrderDetailComponent` showing order info + order items list.
- [ ] REQ-OFL-F-204: Add search bar to product list page calling `/api/v1/products/search?q=`.

#### Testing
- [ ] REQ-OFL-T-201: Write unit tests for `OrderService.createOrder()`: success flow, insufficient stock, empty cart. Min 3 tests.
- [ ] REQ-OFL-T-202: Write unit tests for `CartService`: addItem, getCart, clearCart. Min 3 tests.

### Week 3 Requirements

#### Backend
- [ ] REQ-OFL-B-301: Create `BaseIntegrationTest` extending starter's base. Write integration test for order creation flow (register → login → add to cart → create order → verify stock decreased).
- [ ] REQ-OFL-B-302: Write concurrent stock test: 10 threads simultaneously create orders for same product (stock=10). Verify final stock = 0 and no overselling.
- [ ] REQ-OFL-B-303: Configure RabbitMQ retry with exponential backoff (3 attempts, 1s initial, 2x multiplier). Failed messages go to DLQ.
- [ ] REQ-OFL-B-304: Implement rate limiting using Redis: 100 requests/minute per IP. Return 429 Too Many Requests when exceeded.
- [ ] REQ-OFL-B-305: Run `EXPLAIN ANALYZE` on top 3 most-used queries. Add missing indexes if needed. Document query plans.
- [ ] REQ-OFL-B-306: Create admin endpoints: `GET /api/v1/admin/orders` (all orders, filtered by status/date), `PUT /api/v1/admin/orders/{id}/status` (update status).
- [ ] REQ-OFL-B-307: Add complete Swagger/OpenAPI annotations on all controllers with `@Operation`, `@ApiResponses`.

#### Angular
- [ ] REQ-OFL-F-301: Create `AdminOrderListComponent` for admin view — table with all orders, filter by status dropdown, date range picker.
- [ ] REQ-OFL-F-302: Add order status update action in admin order list (dropdown to change status).
- [ ] REQ-OFL-F-303: Create `DashboardComponent` showing summary cards: total orders, pending orders, total revenue (call summary API if available, or mock data).

#### Testing
- [ ] REQ-OFL-T-301: Write ≥ 5 integration tests using Testcontainers: CRUD product, create order, cart operations.
- [ ] REQ-OFL-T-302: Write concurrent test verifying pessimistic lock prevents overselling.
- [ ] REQ-OFL-T-303: Verify RabbitMQ retry/DLQ: send message that causes exception → verify 3 retries → message in DLQ.

### Week 4 Requirements

- [ ] REQ-OFL-W-401: Complete end-to-end flow: register → login → browse products → add to cart → create order → payment processed → email sent → check order status.
- [ ] REQ-OFL-W-402: Cross-review Team 2 (ClinicQ) code with ≥ 10 comments.
- [ ] REQ-OFL-W-403: Fix ≥ 5 bugs from mentor-created issues.
- [ ] REQ-OFL-W-404: Performance test with `ab -n 1000 -c 50`. Target: avg < 200ms, error rate < 1%.
- [ ] REQ-OFL-W-405: Complete README with setup guide, architecture description, API docs.
- [ ] REQ-OFL-W-406: Prepare and deliver 15-20 minute demo covering: project overview, live demo, code walkthrough, Q&A.
