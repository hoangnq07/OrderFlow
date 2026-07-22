# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Shoppers / Customers (Role: USER)**: Browse products, search catalog, manage cart items, place orders safely, track order lifecycle, receive email receipts.
- **Store Administrators (Role: ADMIN)**: Manage product & category catalog (CRUD, pricing, stock, active status), manage and update order statuses, view store analytics dashboard.

## Product Purpose

OrderFlow provides a full-stack e-commerce order management and processing solution. It ensures seamless shopping experiences while guaranteeing strict transaction integrity, zero-overselling inventory controls under high concurrency, and real-time asynchronous fulfillment notifications.

## Positioning

OrderFlow differentiates itself through high-reliability order processing engineering: deterministic pessimistic locking with ascending ID deadlock prevention, Redis-backed persistent shopping cart session resilience, and event-driven RabbitMQ async payment & notification workflows.

## Operating Context

- Web App UI (Angular 17, modern Glassmorphism design system, responsive across desktop and mobile browsers).
- REST API integration with Java 17 / Spring Boot backend (`/api/v1`).
- Infrastructure ecosystem: PostgreSQL 16 (relational database), Redis 7 (cart hash storage & caching), RabbitMQ (event queueing), MailHog (email sandbox).

## Capabilities and Constraints

### Capabilities
- **Authentication & Security**: JWT-based stateless auth, role-based route guards (USER/ADMIN).
- **Catalog Management**: Category & product CRUD, PostgreSQL `tsvector` full-text search, Redis product detail caching with 30-min TTL.
- **Cart Management**: Redis Hash cart (`cart:{userId}`), 7-day TTL, authoritative backend pricing calculation.
- **Order Processing**: Pessimistic stock locking (`PESSIMISTIC_WRITE`), transactional stock decrease, automated state transition rules (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED` / `CANCELLED`).
- **Async Event Pipeline**: RabbitMQ topic exchanges for `OrderCreatedEvent` and `PaymentCompletedEvent` leading to automated MailHog emails.

### Constraints
- Currency calculation must use `BigDecimal` (no `float`/`double`).
- No physical deletion of products referenced in historical order items (soft delete `active = false`).
- Zero overselling under concurrent load (verified via Testcontainers concurrency tests).

## Brand Commitments

- **Name**: OrderFlow
- **Design Language**: Modern Glassmorphism theme, vibrant dark/light harmonized palettes, sleek typography, smooth micro-animations.

## Evidence on Hand

- Executable Angular 17 frontend (`frontend/`) and Spring Boot 3.2 backend (`backend/`).
- Database migrations (`V1` to `V4`) in `backend/src/main/resources/db/migration/`.
- System specification in `Project 1 - OrderFlow.md` and project rules in `AGENTS.md`.

## Product Principles

1. **Transaction & Inventory Integrity First**: Never trust frontend totals or prices; protect stock strictly on the backend with optimistic/pessimistic locks.
2. **Asynchronous & Resilient Fulfillment**: Decouple slow external tasks (payment processing, email notifications) from core transactional paths using RabbitMQ queues.
3. **Clarity & Delight in UX**: Deliver a premium, fast, glassmorphic UI with dynamic feedback, clean status visualization, and clear validation.

## Accessibility & Inclusion

- Responsive design adaptable to desktop, tablet, and mobile screens.
- Accessible form elements and contrast-compliant colors using Angular Material / standard accessibility guidelines.
