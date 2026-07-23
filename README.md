# OrderFlow (E-commerce Order Processing System)

OrderFlow is a full-stack e-commerce order-processing system built with Java 17, Spring Boot 3.2, Redis, RabbitMQ, PostgreSQL, and Angular 17.

## Tech Stack

**Backend**: Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, PostgreSQL 16, Redis 7, RabbitMQ 3, Flyway, MapStruct, Lombok, SpringDoc OpenAPI

**Frontend**: Angular 17, Angular Material, RxJS, TypeScript

**Infrastructure**: Docker Compose (PostgreSQL, Redis, RabbitMQ, MailHog)

## Core Features & Architecture

```text
Register / Login (JWT)
  ↓
Browse Product Catalog & Search (PostgreSQL FTS + Redis Cache)
  ↓
Add Products to Cart (Redis Hash cart:{userId}, TTL 7 Days)
  ↓
Create Order (DB Transaction + Pessimistic Stock Locking PESSIMISTIC_WRITE)
  ↓
Clear Cart & Publish OrderCreatedEvent (RabbitMQ)
  ↓
Process Payment (PaymentConsumer) -> PaymentCompletedEvent
  ↓
Send Confirmation Email (NotificationConsumer via MailHog)
  ↓
Track Order Status & Admin Order Management
```

## Quick Start

### Prerequisites

- JDK 17+
- Maven 3.9+
- Node.js 18+ and npm
- Docker & Docker Compose

### 1. Start Infrastructure

```bash
cd backend
docker compose up -d
docker compose ps   # Verify 4 services running (PostgreSQL, Redis, RabbitMQ, MailHog)
```

### 2. Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

### 3. Run Frontend

```bash
cd frontend
npm install
npm start
```

- Angular Web App: http://localhost:4200

### 4. Run Tests & Performance Benchmark

```bash
# Run Backend Tests
cd backend
./mvnw test

# Run Apache Bench Stress Test (Windows PowerShell)
.\scripts\run-stress-test.ps1 -BaseUrl "http://localhost:8080" -Requests 1000 -Concurrency 50
```

## Service URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Spring Boot API | http://localhost:8080 | - |
| Swagger UI | http://localhost:8080/swagger-ui.html | - |
| Angular Dev Server | http://localhost:4200 | - |
| PostgreSQL | localhost:5432 | postgres / postgres |
| Redis | localhost:6379 | no auth |
| RabbitMQ Management | http://localhost:15672 | guest / guest |
| MailHog Web UI | http://localhost:8025 | no auth |

## Project Structure

```text
OrderFlow/
├── backend/
│   ├── pom.xml
│   ├── docker-compose.yml
│   └── src/
│       ├── main/java/com/training/starter/
│       │   ├── config/          # Redis, RabbitMQ, OpenAPI, RateLimiting
│       │   ├── security/        # JWT auth flow & RateLimitingFilter
│       │   ├── controller/      # Auth, User, Product, Category, Cart, Order, Admin
│       │   ├── dto/             # Request/Response DTOs
│       │   ├── entity/          # BaseEntity, User, Category, Product, Order, OrderItem
│       │   ├── exception/       # Global exception handler
│       │   ├── consumer/        # RabbitMQ Payment & Notification Consumers
│       │   ├── publisher/       # OrderEventPublisher
│       │   ├── mapper/          # MapStruct
│       │   ├── repository/      # Spring Data JPA
│       │   └── service/         # Business logic with Pessimistic Locking
│       └── test/                # Unit & Testcontainers E2E tests
├── frontend/
│   └── src/app/
│       ├── core/                # Interceptors, guards, services, models
│       ├── layout/              # Main + Auth + Admin layouts
│       ├── features/            # Auth, Products, Cart, Orders, Admin, Dashboard
│       └── shared/              # Reusable components
├── docs/                        # Detailed System Architecture & Guide Documents
│   ├── architecture.md          # Architecture & C4/Mermaid specifications
│   ├── api-documentation.md     # REST API endpoint reference
│   ├── deployment-and-setup.md  # Docker & Local environment setup guide
│   └── presentation-demo-guide.md # 15-20 min live demo presentation guide
├── scripts/                     # Apache Bench performance test scripts
├── benchmark-report.md          # Stress test latency & throughput report
└── README.md
```
