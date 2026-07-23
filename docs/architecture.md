# OrderFlow — System Architecture & Design Specification

## 1. System Overview

**OrderFlow** is an enterprise-grade full-stack e-commerce order-processing platform designed for high performance, transactional consistency, and fault-tolerant asynchronous event processing.

```mermaid
graph TD
    Client[Angular 17 Web Frontend] -->|REST API / JWT| SpringBoot[Spring Boot 3.2 Backend Service]
    SpringBoot -->|Spring Data JPA| Postgres[(PostgreSQL 16 DB)]
    SpringBoot -->|Redis Template Hash & Cache| Redis[(Redis 7 In-Memory Cache)]
    SpringBoot -->|Order Events Publisher| RabbitMQ{RabbitMQ 3 Exchange}
    RabbitMQ -->|payment.process.queue| PaymentConsumer[Payment Processing Consumer]
    PaymentConsumer -->|PaymentCompletedEvent| RabbitMQ
    RabbitMQ -->|notification.email.queue| NotificationConsumer[Email Notification Consumer]
    NotificationConsumer -->|SMTP| MailHog[MailHog Mock Mail Server]
```

---

## 2. Core Architectural Diagrams & Sequence Flows

### 2.1 Order Creation & Pessimistic Locking Sequence

This diagram illustrates the atomic `@Transactional` order placement flow with pessimistic lock (`PESSIMISTIC_WRITE`) sorted by Product ID to prevent deadlock and overselling under high concurrency.

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Angular Client
    participant Controller as OrderController
    participant Service as OrderServiceImpl
    participant Redis as Redis Cart (cart:userId)
    participant Repo as ProductRepository
    participant DB as PostgreSQL DB
    participant MQ as RabbitMQ Exchange

    Customer->>Controller: POST /api/v1/orders (shippingAddress, note)
    Controller->>Service: createOrder(authenticatedUserId, request)
    Service->>Redis: getCartItems(userId)
    Redis-->>Service: CartItems List
    
    rect rgb(240, 248, 255)
        note over Service, DB: @Transactional Transaction Boundary Starts
        Service->>Service: Sort Product IDs ascending (Prevent Deadlock)
        Service->>Repo: findAllByIdInWithPessimisticLock(sortedProductIds)
        Repo->>DB: SELECT ... FOR UPDATE (PESSIMISTIC_WRITE)
        DB-->>Service: Locked Product Entities
        
        Service->>Service: Validate Stock Availability & Calculate Totals
        Service->>Repo: decreaseStock(productId, quantity)
        Service->>DB: INSERT INTO orders & order_items
        DB-->>Service: Order Created (ID: 101)
    end
    
    Service->>Redis: clearCart(userId)
    Service->>MQ: publish OrderCreatedEvent(orderId=101)
    Service-->>Controller: OrderResponse DTO
    Controller-->>Customer: HTTP 201 Created (Order Response)
```

---

### 2.2 Asynchronous Event Processing & Retry/DLQ Sequence

Order completion events trigger decoupled asynchronous workers for payment processing and email notifications via RabbitMQ.

```mermaid
sequenceDiagram
    autonumber
    participant Publisher as OrderEventPublisher
    participant Exchange as order.exchange (Topic)
    participant PayQueue as payment.process.queue
    participant PayConsumer as PaymentConsumer
    participant PayEx as payment.exchange (Direct)
    participant EmailQueue as notification.email.queue
    participant MailConsumer as NotificationConsumer
    participant MailHog as MailHog SMTP Server
    participant DLQ as order.dlq (Dead Letter Queue)

    Publisher->>Exchange: publish OrderCreatedEvent
    Exchange->>PayQueue: route (order.created)
    
    rect rgb(245, 245, 245)
        note over PayQueue, PayConsumer: Retry Policy (3 attempts, 2x backoff)
        PayQueue->>PayConsumer: consume message
        alt Success
            PayConsumer->>PayConsumer: Simulate Mock Payment
            PayConsumer->>PayEx: publish PaymentCompletedEvent
            PayEx->>EmailQueue: route (payment.completed)
            EmailQueue->>MailConsumer: consume message
            MailConsumer->>MailHog: Send Order Confirmation Email
        else Failure (Max Retries Exceeded)
            PayQueue->>DLQ: Route to Dead Letter Queue (order.dlq)
        end
    end
```

---

### 2.3 Product Detail Redis Caching & Invalidation Flow

Product details are cached in Redis to achieve sub-10ms response times. Admin updates automatically trigger cache eviction.

```mermaid
sequenceDiagram
    autonumber
    actor User as Client / Admin
    participant Controller as ProductController
    participant Service as ProductServiceImpl
    participant Redis as Redis Cache (product:id)
    participant DB as PostgreSQL DB

    alt GET Product Detail (User Query)
        User->>Controller: GET /api/v1/products/{id}
        Controller->>Service: getProductById(id)
        Service->>Redis: get("product:" + id)
        alt Cache Hit
            Redis-->>Service: ProductResponse (Cached JSON)
            Service-->>Controller: Return Cached Data (<10ms)
        else Cache Miss
            Redis-->>Service: null
            Service->>DB: findById(id)
            DB-->>Service: Product Entity
            Service->>Redis: set("product:" + id, data, TTL 30m)
            Service-->>Controller: ProductResponse DTO
        end
        Controller-->>User: HTTP 200 OK
    else PUT Update Product (Admin Edit)
        User->>Controller: PUT /api/v1/products/{id}
        Controller->>Service: updateProduct(id, request)
        Service->>DB: save(updatedProduct)
        Service->>Redis: delete("product:" + id) [Evict Cache]
        Service-->>Controller: Updated Product DTO
        Controller-->>User: HTTP 200 OK
    end
```

---

### 2.4 API Rate Limiting Sequence (`RateLimitingFilter`)

Incoming requests pass through a Redis-backed sliding window rate limiter (max 100 requests per minute per IP).

```mermaid
sequenceDiagram
    autonumber
    actor Client as HTTP Client (IP: 192.168.1.100)
    participant Filter as RateLimitingFilter
    participant Redis as Redis Server
    participant App as Spring Security & Controllers

    Client->>Filter: HTTP Request
    Filter->>Redis: INCR rate_limit:192.168.1.100
    Redis-->>Filter: currentCount (e.g. 101)
    
    alt currentCount == 1
        Filter->>Redis: EXPIRE rate_limit:192.168.1.100 60s
    end
    
    alt currentCount <= 100
        Filter->>App: chain.doFilter(request, response)
        App-->>Client: HTTP 200 / 201 Success Response
    else currentCount > 100
        Filter-->>Client: HTTP 429 Too Many Requests (Rate limit exceeded)
    end
```

---

### 2.5 Order Status Transition State Machine

Order status follows a strict validated state machine. Arbitrary transitions (e.g., direct jump from `PENDING` to `DELIVERED`) are rejected with `HTTP 400 Bad Request`.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Order Created
    
    PENDING --> CONFIRMED: Admin Confirms
    PENDING --> CANCELLED: User/Admin Cancels
    
    CONFIRMED --> PROCESSING: Admin Processes
    CONFIRMED --> CANCELLED: Admin Cancels
    
    PROCESSING --> SHIPPED: Admin Ships Order
    PROCESSING --> CANCELLED: Admin Cancels
    
    SHIPPED --> DELIVERED: Order Delivered to Customer
    
    DELIVERED --> [*]
    CANCELLED --> [*]
```

---

## 3. Database Schema Specification

### 3.1 Core Tables & Relations

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    CATEGORIES ||--o{ PRODUCTS : contains
    ORDERS ||--|{ ORDER_ITEMS : includes
    PRODUCTS ||--o{ ORDER_ITEMS : snapshot

    USERS {
        bigint id PK
        varchar email UK
        varchar password
        varchar full_name
        varchar role
        timestamp created_at
    }

    CATEGORIES {
        bigint id PK
        varchar name
        varchar slug UK
        timestamp created_at
    }

    PRODUCTS {
        bigint id PK
        varchar name
        varchar slug UK
        text description
        decimal price
        int stock
        bigint category_id FK
        varchar image_url
        boolean active
        bigint version
        tsvector search_vector
        timestamp created_at
    }

    ORDERS {
        bigint id PK
        bigint user_id FK
        varchar status
        decimal total_amount
        text shipping_address
        text note
        timestamp created_at
    }

    ORDER_ITEMS {
        bigint id PK
        bigint order_id FK
        bigint product_id FK
        varchar product_name
        int quantity
        decimal unit_price
        decimal subtotal
    }
```

### 3.2 Index Strategy (Flyway Migration V4)
- `idx_products_category`: Fast lookup by category.
- `idx_products_active`: Partial index on active products.
- `idx_products_search`: GIN Index on `search_vector` for PostgreSQL Full-Text Search.
- `idx_orders_user_status`: Composite index for user order filtering.

---

## 4. Frontend Component Architecture (Angular 17)

```mermaid
graph TD
    App[AppComponent] --> AuthLayout[AuthLayoutComponent]
    App --> MainLayout[MainLayoutComponent]
    App --> AdminLayout[AdminLayoutComponent]

    AuthLayout --> Login[LoginComponent]
    AuthLayout --> Register[RegisterComponent]

    MainLayout --> ProductList[ProductListComponent]
    MainLayout --> Cart[CartComponent]
    MainLayout --> OrderList[OrderListComponent]
    MainLayout --> OrderDetail[OrderDetailComponent]

    AdminLayout --> Dashboard[DashboardComponent]
    AdminLayout --> AdminOrders[AdminOrderListComponent]
    AdminLayout --> ProductForm[ProductFormComponent]
```

---

## 5. Technology Stack Summary

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Backend Framework** | Java 17, Spring Boot 3.2.5 | Core API & Business logic service |
| **Database** | PostgreSQL 16 | Relational persistent database |
| **In-Memory Cache & Cart**| Redis 7 | Redis Hash Cart & Product Detail Caching |
| **Message Broker** | RabbitMQ 3 | Async Event-Driven architecture |
| **Mail Mock** | MailHog | SMTP email testing & inspection |
| **Frontend Framework** | Angular 17, TypeScript, Material | Responsive SPA Web Application |
| **Schema Migration** | Flyway 9 | Deterministic DB schema version control |
| **Documentation** | SpringDoc OpenAPI (Swagger) | Interactive REST API documentation |
