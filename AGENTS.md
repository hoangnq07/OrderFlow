# AGENTS.md — OrderFlow Development Rules

## 1. Project Overview

OrderFlow is a full-stack e-commerce order-processing system.

Main business flow:

```text
Register
→ Login
→ Browse products
→ Add products to cart
→ Create order
→ Lock and decrease stock
→ Process mock payment
→ Send confirmation email
→ Track order status
```

Technology stack:

### Backend

* Java 17
* Spring Boot 3.2.5
* Maven
* Spring Data JPA
* Spring Security with JWT
* PostgreSQL
* Flyway
* Redis
* RabbitMQ
* MailHog
* MapStruct
* Lombok
* Swagger/OpenAPI
* JUnit 5
* Mockito
* Testcontainers

### Frontend

* Angular 17
* TypeScript
* Angular Material
* Reactive Forms
* RxJS

The project is based on `training-starter`. Existing authentication, security, common responses, exception handling, Docker configuration and test infrastructure should be reused unless a task explicitly requires changing them.

---

## 2. Sources of Truth

Agents must follow these sources in priority order:

1. The current issue or requirement ID.
2. This `AGENTS.md` file.
3. Existing project architecture and conventions.
4. Database migrations.
5. Swagger/OpenAPI contract.
6. README documentation.

Do not implement functionality that is not required by the current issue.

Each implementation should reference its requirement ID where appropriate.

Examples:

```text
REQ-OFL-B-101
REQ-OFL-F-201
REQ-OFL-T-301
```

When requirements conflict with existing code, report the conflict before introducing a large architectural change.

---

## 3. General Agent Behavior

Before editing code, agents must:

1. Read the relevant existing implementation.
2. Identify affected modules and files.
3. Check existing tests.
4. Check database migrations and API contracts.
5. Make the smallest change that fully satisfies the requirement.

Agents must not:

* Rewrite unrelated code.
* Reformat the entire repository.
* Rename large package trees without an explicit task.
* Replace working starter infrastructure without a clear reason.
* Introduce a new framework when an existing dependency already solves the problem.
* Add unnecessary abstraction.
* Generate placeholder implementations that pretend to be complete.
* Disable tests to make the build pass.
* remove validation, security or database constraints.
* Commit secrets, generated files or build artifacts.
* Add TODO comments instead of completing required behavior.

When assumptions are necessary, document them clearly in the pull request.

---

## 4. Repository Structure

Expected structure:

```text
OrderFlow/
├── AGENTS.md
├── README.md
├── .gitignore
├── .env.example
├── backend/
│   ├── pom.xml
│   ├── docker-compose.yml
│   └── src/
└── frontend/
    ├── package.json
    ├── angular.json
    └── src/
```

Generated directories must not be committed:

```text
backend/target/
frontend/node_modules/
frontend/dist/
frontend/.angular/
```

Agents must not edit generated files inside these directories.

---

## 5. Backend Architecture

Keep the existing Spring Boot architecture unless the task explicitly requires restructuring it.

New OrderFlow domains include:

```text
category
product
cart
order
payment
notification
```

For each domain, use clear separation of responsibility:

```text
Controller
→ Service
→ Repository
→ Database
```

DTO mapping should use MapStruct where practical.

Controllers must not contain business logic.

Repositories must not contain workflow logic.

Services are responsible for:

* Business validation.
* Transaction boundaries.
* Authorization-related ownership checks.
* Entity state transitions.
* Publishing domain events.
* Coordinating Redis, PostgreSQL and RabbitMQ operations.

Do not expose JPA entities directly through REST APIs.

Use request and response DTOs.

---

## 6. Java Coding Rules

Use Java 17 language features only when they improve readability.

Required conventions:

* Constructor injection only.
* Do not use field injection.
* Prefer immutable local variables.
* Use `BigDecimal` for money.
* Never use `double` or `float` for product prices or order totals.
* Use enums for business statuses.
* Validate request DTOs with Jakarta Validation.
* Use meaningful method and variable names.
* Avoid methods with multiple unrelated responsibilities.
* Avoid static mutable state.
* Do not catch `Exception` unless there is a specific recovery strategy.
* Do not silently ignore exceptions.
* Do not return `null` collections.
* Do not use `Optional` as an entity field or DTO field.

Example constructor injection:

```java
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
}
```

---

## 7. API Rules

Base API path:

```text
/api/v1
```

Use standard HTTP semantics:

```text
GET     Read
POST    Create
PUT     Full business update or state-changing action defined by the contract
PATCH   Partial update when explicitly designed
DELETE  Delete or soft delete
```

Use the shared response models when they are already used by the starter:

```text
ApiResponse<T>
PageResponse<T>
```

All paginated endpoints must support validated pagination parameters.

Errors must be handled through `GlobalExceptionHandler`.

Do not return stack traces, SQL errors or internal exception messages to clients.

Swagger annotations should describe:

* Endpoint purpose.
* Authentication requirements.
* Request body.
* Success response.
* Common error responses.

---

## 8. Security Rules

Backend authorization is mandatory. Hiding UI elements is not authorization.

Expected access model:

```text
Public:
GET /api/v1/products/**
GET /api/v1/categories/**
POST /api/v1/auth/**

USER:
GET/POST/PUT/DELETE /api/v1/cart/**
GET/POST /api/v1/orders/**
PUT /api/v1/orders/{id}/cancel

ADMIN:
POST/PUT/DELETE /api/v1/products/**
POST/PUT/DELETE /api/v1/categories/**
GET/PUT /api/v1/admin/orders/**
/api/v1/users/**
```

Agents must:

* Preserve password hashing.
* Preserve JWT validation.
* Validate resource ownership.
* Prevent users from reading or modifying another user’s cart or orders.
* Prevent normal users from accessing admin endpoints.
* Keep CORS configuration explicit.
* Never hardcode credentials or JWT secrets.
* Read secrets from environment variables or configuration.
* Distinguish access tokens from refresh tokens when modifying JWT logic.

Never trust `userId` supplied by the client for user-owned resources.

Retrieve the authenticated user from the Spring Security context.

Incorrect:

```java
createOrder(request.getUserId(), request);
```

Preferred:

```java
createOrder(authenticatedUserId, request);
```

---

## 9. Database and Flyway Rules

Flyway migrations are the source of truth for database schema.

Existing migrations must never be edited after they have been merged or applied to a shared environment.

Create a new migration for every schema change.

Naming convention:

```text
V2__create_product_tables.sql
V3__create_order_tables.sql
V4__create_indexes.sql
```

Migration rules:

* Include primary keys.
* Include foreign keys.
* Include unique constraints.
* Include `NOT NULL` where required.
* Add indexes based on query patterns.
* Use explicit column names.
* Keep migrations deterministic.
* Avoid environment-specific data.
* Do not use Hibernate schema generation in normal application profiles.

Application configuration should normally use:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

For integration tests, prefer running Flyway instead of relying on `create-drop`.

JPA entity mappings must match Flyway migrations exactly.

---

## 10. Product and Category Rules

Products must support:

* Unique slug.
* Price using `BigDecimal`.
* Non-negative stock.
* Category relationship.
* Active status.
* Soft delete.
* Optimistic version field where defined.
* Full-text search.
* Pagination.
* Redis caching.

Product deletion should normally set:

```text
active = false
```

Do not physically delete products referenced by order items.

Order items must store a product snapshot:

```text
productId
productName
unitPrice
quantity
subtotal
```

Historical orders must not change when a product is renamed or repriced.

---

## 11. Cart and Redis Rules

The shopping cart is Redis-based.

Expected key:

```text
cart:{userId}
```

Expected structure:

```text
Redis Hash
field = productId
value = CartItem DTO
```

Cart TTL:

```text
7 days
```

Agents must:

* Refresh TTL when the cart is changed.
* Validate that the product exists and is active.
* Validate requested quantity.
* Never trust a product price sent by the frontend.
* Read the current authoritative price from the backend.
* Avoid storing JPA entities in Redis.
* Use explicit DTO serialization.
* Clear the cart only after order creation succeeds.

Redis failure handling must not create a partially persisted order.

---

## 12. Order and Stock Rules

Order creation is a critical transactional operation.

Required flow:

```text
1. Read cart items.
2. Sort product IDs.
3. Lock products using PESSIMISTIC_WRITE.
4. Validate that all products exist and are active.
5. Validate stock availability.
6. Calculate totals on the backend.
7. Decrease stock.
8. Create order.
9. Create order items.
10. Commit the database transaction.
11. Clear the cart.
12. Publish OrderCreatedEvent.
```

Products must be locked in ascending ID order to reduce deadlock risk.

Never perform stock validation outside the locking transaction.

Never allow stock to become negative.

The implementation must prevent overselling when multiple requests purchase the same product concurrently.

Order status transitions must follow:

```text
PENDING
→ CONFIRMED
→ PROCESSING
→ SHIPPED
→ DELIVERED
```

Allowed cancellation paths must be explicitly validated.

Do not allow arbitrary status changes.

Implement a transition validation method rather than directly assigning any requested status.

---

## 13. Transaction Rules

Use `@Transactional` at the service layer.

Do not place transaction boundaries in controllers.

Order creation and stock decrease must run in the same database transaction.

Do not execute slow network operations such as email sending inside the main order transaction.

RabbitMQ publishing must occur only when the persisted state is valid.

Where message publication consistency matters, document the selected strategy:

* Publish after transaction commit.
* Transactional event listener.
* Outbox pattern, if explicitly required.

Do not introduce the outbox pattern unless it is required by the current project scope.

---

## 14. RabbitMQ Rules

Expected asynchronous flow:

```text
OrderCreatedEvent
→ payment.process.queue
→ PaymentConsumer
→ PaymentCompletedEvent
→ notification.email.queue
→ NotificationConsumer
→ MailHog
```

Agents must:

* Use typed event DTOs.
* Include an event ID.
* Include an order ID.
* Include event creation time.
* Keep consumers idempotent where practical.
* Configure retry.
* Configure exponential backoff.
* Configure DLQ.
* Log failures with enough context.
* Avoid infinite retry loops.

Do not send JPA entities through RabbitMQ.

Consumers must not assume the referenced database record still has its original state.

---

## 15. Cache Rules

Product detail cache should use a deterministic key such as:

```text
product:{productId}
```

Expected TTL:

```text
30 minutes
```

Agents must invalidate affected cache entries when a product is:

* Updated.
* Soft deleted.
* Reactivated.
* Modified in a way that changes public product data.

Cache is an optimization, not the source of truth.

The application must remain logically correct when the cache is empty.

---

## 16. Frontend Rules

Use Angular standalone components or the project’s existing convention consistently.

Use:

* Reactive Forms.
* Typed models.
* Services for HTTP communication.
* Interceptors for authentication.
* Guards for protected routes.
* Shared components for pagination and dialogs.
* RxJS operators instead of nested subscriptions.

Components should not construct backend URLs directly.

URLs belong in API services or environment configuration.

Do not use `any` unless interaction with an untyped external API makes it unavoidable.

Every form must provide:

* Client-side validation.
* Useful validation messages.
* Disabled submit state while invalid or submitting.
* Error handling.
* Loading state.

Frontend prices are display values only. Backend-calculated totals are authoritative.

---

## 17. Frontend Security Rules

Frontend route guards improve usability but do not replace backend authorization.

Agents must:

* Protect user routes with `authGuard`.
* Protect admin routes with a role guard.
* Handle 401 responses.
* Handle 403 responses separately from 401.
* Avoid storing passwords.
* Avoid logging JWTs.
* Avoid exposing secrets in Angular environment files.
* Decode JWT only for UI decisions, never as proof of authorization.

A `403 Forbidden` response should not automatically log the user out.

A `401 Unauthorized` response may trigger token refresh or logout according to the implemented authentication strategy.

---

## 18. Testing Rules

Every business change must include relevant tests.

### Unit tests

Use JUnit 5 and Mockito.

Unit tests should cover:

* Success path.
* Resource not found.
* Duplicate resource.
* Invalid input.
* Invalid state transition.
* Insufficient stock.
* Empty cart.
* Unauthorized ownership access.

### Integration tests

Use Testcontainers for:

* PostgreSQL.
* Redis.
* RabbitMQ.

Integration tests should verify real interactions rather than mocking repositories.

Required important flows include:

```text
Register
→ Login
→ Add product to cart
→ Create order
→ Verify stock decreased
```

Concurrency test:

```text
10 threads order a product with stock = 10
→ final stock = 0
→ no overselling
```

RabbitMQ test:

```text
Consumer fails
→ retry occurs
→ message reaches DLQ
```

Do not make tests order-dependent.

Do not use fixed sleeps when polling or Awaitility can be used.

Do not weaken assertions merely to make tests pass.

---

## 19. Build Verification

Before considering a backend task complete, run:

```bash
cd backend
./mvnw clean verify
```

On Windows:

```powershell
cd backend
.\mvnw.cmd clean verify
```

Before considering a frontend task complete, run:

```bash
cd frontend
npm ci
npm run build
npm test
```

If the project does not yet have a stable frontend test script, at minimum run:

```bash
npm run build
```

For full-stack changes, verify Docker services:

```bash
docker compose up -d
docker compose ps
```

An agent must report any verification command it could not execute.

Never claim that tests passed unless they were actually run successfully.

---

## 20. Git Rules

Branch naming:

```text
feature/OFL-XXX-description
bugfix/OFL-XXX-description
test/OFL-XXX-description
chore/OFL-XXX-description
docs/OFL-XXX-description
```

Examples:
```text
feature/OFL-002-category-entity
feature/OFL-003-cart-component
test/OFL-004-order-integration
bugfix/OFL-005-order-stock-locking
chore/OFL-001-project-bootstrap
docs/OFL-002-readme-setup
```

Commit convention:

```text
feat(product): implement product creation
fix(order): prevent stock from becoming negative
test(order): add concurrent ordering test
chore(setup): configure OrderFlow infrastructure
docs(readme): document local environment
```

Each commit should represent one logical change.

Do not mix:

* Large formatting changes.
* Dependency upgrades.
* Business implementation.
* Unrelated bug fixes.

Agents must not:

* Force-push shared branches.
* Commit directly to protected `main`.
* Rewrite Git history without explicit approval.
* Commit `.env`.
* Commit passwords or tokens.
* Commit `target`, `node_modules` or generated build output.

---

## 21. Pull Request Rules

Every pull request should contain:

```markdown
## Requirement

REQ-OFL-B-XXX

## Changes

- Change one
- Change two

## Verification

- [ ] Backend tests pass
- [ ] Frontend builds
- [ ] Flyway migration succeeds
- [ ] Swagger updated
- [ ] Manual flow verified

## Notes

Any design decisions, assumptions or limitations.
```

Pull requests should be small enough to review.

Avoid combining several unrelated requirements into one pull request.

Database migrations, entity changes and repository changes for one feature may belong in the same PR.

---

## 22. Documentation Rules

Update documentation when changing:

* Local setup.
* Environment variables.
* Docker services.
* API contracts.
* Message queues.
* Database schema.
* Authentication behavior.
* Required commands.

`.env.example` must include all required variables without real secrets.

Swagger annotations should stay synchronized with implementation.

README examples must be executable and current.

---

## 23. Definition of Done

A task is complete only when:

```text
[ ] The requirement is fully implemented.
[ ] Code follows existing architecture.
[ ] Input validation is implemented.
[ ] Authorization is enforced.
[ ] Database migration is included when necessary.
[ ] Unit tests are included.
[ ] Integration tests are included when appropriate.
[ ] Tests pass.
[ ] Backend compiles.
[ ] Frontend builds when affected.
[ ] Swagger is updated when APIs change.
[ ] Documentation is updated when setup changes.
[ ] No secrets or generated files are committed.
[ ] No unrelated code was modified.
```

Partial implementation must be clearly reported as partial.

---

## 24. Prohibited Shortcuts

The following shortcuts are not allowed:

* Returning mocked data from production endpoints.
* Using in-memory collections instead of PostgreSQL or Redis when the requirement specifies them.
* Removing pessimistic locking.
* Skipping stock validation.
* Trusting frontend totals or prices.
* Hardcoding authenticated user IDs.
* Disabling Spring Security.
* Using `permitAll()` to solve authorization errors.
* Setting `ddl-auto: create` to avoid creating migrations.
* Catching and ignoring RabbitMQ failures.
* Commenting out failed tests.
* Increasing stock during cancellation without verifying the order state.
* Physically deleting records required for order history.
* Adding dependencies without checking whether the starter already provides equivalent functionality.
* Refactoring the whole repository during a feature task.

---

## 25. Agent Completion Report

After completing a task, the agent should report:

```text
Implemented:
- Files and functionality changed.

Tests:
- Commands executed.
- Results.

Not verified:
- Commands or environments that could not be run.

Risks:
- Remaining technical risks or assumptions.

Next:
- The most direct follow-up task, when relevant.
```

The report must be factual. Never claim a command, test or runtime verification that was not actually performed.
