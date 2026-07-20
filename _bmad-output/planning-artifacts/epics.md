---
stepsCompleted:
  - "step-01-validate-prerequisites"
  - "step-02-design-epics"
inputDocuments:
  - "_bmad-output/planning-artifacts/prd-orderflow/prd.md"
  - "README.md"
---

# OrderFlow - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for OrderFlow, decomposing the requirements from the PRD, architecture context, and technical schedule into 20 actionable stories across 5 epics.

## Requirements Inventory

### Functional Requirements

- FR1: Category & Product Data Model (Flyway migrations V2/V3, JPA Entities Category & Product) [REQ-OFL-B-101, B-102, B-103, B-104]
- FR2: Product Catalog API (`GET /api/v1/products` with pagination, sorting, and full CRUD endpoints) [REQ-OFL-B-105, B-106]
- FR3: Category API (`GET /api/v1/categories`, `POST /api/v1/categories`) [REQ-OFL-B-107, B-108]
- FR4: Angular Catalog Views (Product table with pagination, category filter, Reactive Form for product CRUD) [REQ-OFL-F-101, F-102, F-103, F-104]
- FR5: Redis Cart Service (Redis-backed CartService: `addItem`, `updateQuantity`, `removeItem`, `getCart`, `clearCart`) [REQ-OFL-B-201]
- FR6: Cart REST Endpoints (`GET /api/v1/cart`, `POST /api/v1/cart/items`, `PUT`, `DELETE`) [REQ-OFL-B-202]
- FR7: Angular Cart UI (`CartComponent` with quantity adjustments and checkout) [REQ-OFL-F-201]
- FR8: Product Detail Cache (Redis Caching on product detail endpoints with cache invalidation on updates) [REQ-OFL-B-210]
- FR9: Transactional Order Creation (`OrderService.createOrder()` with pessimistic stock locking `PESSIMISTIC_WRITE`) [REQ-OFL-B-203]
- FR10: Order Listing & Query Optimization (Order REST endpoints, N+1 query optimization using Fetch Joins/Entity Graphs) [REQ-OFL-B-204, B-205]
- FR11: Angular Customer Order UI (`OrderListComponent` and `OrderDetailComponent`) [REQ-OFL-F-202, F-203]
- FR12: Async Event Messaging (RabbitMQ Exchanges, Queues, Bindings, `OrderEventPublisher`, `PaymentConsumer` mock, `NotificationConsumer` via MailHog) [REQ-OFL-B-207, B-208, B-209]
- FR13: RabbitMQ Resiliency (Retry with exponential backoff and Dead Letter Queue - DLQ) [REQ-OFL-B-303, T-303]
- FR14: Full-Text Search (PostgreSQL `tsvector` FTS for product search & Angular search bar) [REQ-OFL-B-206, F-204]
- FR15: API Rate Limiting (Redis-based rate limiter at 100 req/min/IP) [REQ-OFL-B-304]
- FR16: Admin Order Management (Admin order endpoints with status filter/update & Angular `AdminOrderListComponent`) [REQ-OFL-B-306, F-301, F-302]
- FR17: Admin Dashboard (Angular `DashboardComponent` showing Total Orders, Pending Orders, Total Revenue) [REQ-OFL-F-303]
- FR18: DB Query Tuning (Profiling slow queries using `EXPLAIN ANALYZE` and adding DB indexes) [REQ-OFL-B-305]

### NonFunctional Requirements

- NFR1: Performance & Latency (Read APIs < 100ms with Redis; Order Creation API < 500ms under normal load)
- NFR2: Data Consistency & Concurrency (`PESSIMISTIC_WRITE` lock on product stock to prevent overselling)
- NFR3: Resilience & Fault Tolerance (RabbitMQ DLQ + exponential backoff retry)
- NFR4: Security & Rate Limiting (JWT Authentication for protected endpoints, Redis Rate Limiter at 100 req/min/IP)
- NFR5: Quality Assurance & Test Coverage (Unit tests for services, Testcontainers E2E tests, Concurrency test with 10 threads, Apache Bench stress test)

### Additional Requirements

- Starter Codebase & Stack: Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, PostgreSQL 16, Redis 7, RabbitMQ 3, Flyway, MapStruct, Lombok, SpringDoc OpenAPI, Angular 17.
- Infrastructure: Docker Compose (PostgreSQL, Redis, RabbitMQ, MailHog).
- Cross-Team Review: Code review for Team 2 (ClinicQ) with 10+ constructive PR comments [REQ-OFL-W-402].
- System Documentation & Delivery: README system architecture & local setup guide, live demo presentation (15-20 min) [REQ-OFL-W-405, W-406].

### UX Design Requirements

- UX-DR1: Angular Material UI layout with sidebar navigation and main responsive layout.
- UX-DR2: Product & Category table with server-side pagination component.
- UX-DR3: Product Reactive Form with input validation error messages and snackbar notifications.
- UX-DR4: Interactive Cart view with instant quantity updates and clear cart actions.
- UX-DR5: Customer Order List & Detail views displaying order status badges and item breakdown.
- UX-DR6: Admin Order Management table with status filter dropdowns and status change action dialogs.
- UX-DR7: Admin Dashboard view with summary cards for total orders, pending orders, and total revenue.

## FR Coverage Map

- FR1 -> Story 1.1
- FR2 -> Story 1.2, Story 1.3
- FR3 -> Story 1.2, Story 1.4
- FR4 -> Story 1.3, Story 1.4
- FR5 -> Story 1.5
- FR6 -> Story 2.1
- FR7 -> Story 2.2
- FR8 -> Story 2.5
- FR9 -> Story 2.2
- FR10 -> Story 2.1
- FR11 -> Story 2.3
- FR12 -> Story 2.3, Story 2.4
- FR13 -> Story 3.4
- FR14 -> Story 2.5
- FR15 -> Story 3.1
- FR16 -> Story 3.1, Story 3.2
- FR17 -> Story 3.3
- FR18 -> Story 3.3

## Epic List

- Epic 1: Product Catalog & Category Management
- Epic 2: Shopping Cart & Order Placement
- Epic 3: Caching, Rate Limiting & Admin Operations
- Epic 4: End-to-End Verification & Bug Fixing
- Epic 5: Performance Optimization, Documentation & Delivery

---

## Epic 1: Product Catalog & Category Management

Goal: Develop Category and Product database models, CRUD services, list pages, forms, and validation rules.

### Story 1.1: Entity Migration Setup for Category and Product
As a developer, I want to create Category & Product JPA Entities and Flyway V2 migrations, so that the base catalog data model is available.

### Story 1.2: Product and Category REST Endpoints
As a developer/client, I want REST endpoints for Product and Category CRUD operations with pagination, so that products can be retrieved and managed.

### Story 1.3: Angular Product Catalog Integration and Navigation
As a customer, I want to view the product catalog table with pagination and navigate via sidebar, so that I can explore products.

### Story 1.4: Angular Product Form Component and Category Unit Tests
As an admin, I want a Reactive Form to create/edit products, and unit tests for CategoryService, so that product data entry is validated and reliable.

### Story 1.5: Product Unit Tests and Redis Cart Service
As a developer, I want unit tests for ProductService and a Redis-backed CartService, so that cart state is fast and persistent.

---

## Epic 2: Shopping Cart & Order Placement

Goal: Implement the Redis-based shopping cart, pessimistic stock locking on order placement, and RabbitMQ async worker flow.

### Story 2.1: Order Listing Optimization and Cart REST Endpoints
As a developer, I want optimized Order listing APIs avoiding N+1 queries and Cart REST endpoints, so that cart and order data retrieval is fast.

### Story 2.2: Transactional Order Creation with Pessimistic Locking
As a customer, I want to place an order with guaranteed stock locking, so that overselling is prevented under concurrent requests.

### Story 2.3: Customer Order UI and RabbitMQ Event Infrastructure
As a customer, I want to view my order history and detail views while order events publish asynchronously to RabbitMQ.

### Story 2.4: Order Creation Unit Tests and RabbitMQ Consumers
As a system, I want mock payment and email consumers processing order events, so that payment and notifications occur asynchronously.

### Story 2.5: PostgreSQL Full-Text Search and Redis Product Detail Cache
As a customer, I want fast full-text product search and cached product details, so that catalog browsing is responsive.

---

## Epic 3: Caching, Rate Limiting & Admin Operations

Goal: Optimize performance, enable Admin features, and verify complete integration (Testcontainers & Stress tests).

### Story 3.1: API Rate Limiting and Admin Order Backend APIs
As an admin, I want Redis API rate limiting and admin order management endpoints, so that the API is protected and orders can be managed.

### Story 3.2: E2E Integration Test and Admin Order Management UI
As an admin, I want an Angular UI to manage customer order statuses, backed by E2E integration tests.

### Story 3.3: Database Query Tuning and Admin Dashboard UI
As an admin, I want a high-level analytics dashboard and optimized DB indexes, so that system metrics and DB performance are visible and fast.

### Story 3.4: Concurrency Stock Lock Testing and RabbitMQ DLQ Retry Setup
As a developer, I want concurrency integration tests (10 threads) and RabbitMQ DLQ retry setup, so that system resiliency under load is verified.

### Story 3.5: Concurrency Lock Verification and Swagger Testcontainers Completion
As a developer, I want verified concurrency test stability and complete OpenAPI/Testcontainers tests.

---

## Epic 4: End-to-End Verification & Bug Fixing

Goal: Conduct full system verification, cross-team code reviews, and bug triage.

### Story 4.1: Full E2E Flow Validation and Bug Triage
As a QA/Developer team, I want to test full end-to-end workflows and resolve all mentor-reported bugs.

### Story 4.2: Cross-Team Code Review
As a peer reviewer, I want to review Team 2 (ClinicQ) code and provide constructive code review feedback.

---

## Epic 5: Performance Optimization, Documentation & Delivery

Goal: Polish the system, conduct stress testing, update documentation, and deliver the final presentation.

### Story 5.1: Stress Testing with Apache Bench and Response Time Tuning
As a developer, I want to run Apache Bench stress tests to measure latency and optimize server throughput under high concurrency.

### Story 5.2: Final Code Cleanup and Test Coverage Verification
As a developer, I want to clean up codebase formatting and verify total test coverage across the application.

### Story 5.3: System Architecture Documentation and Live Demo Presentation
As a team, I want complete README system architecture documentation and presentation slides to deliver a 15-20 min live demo.
