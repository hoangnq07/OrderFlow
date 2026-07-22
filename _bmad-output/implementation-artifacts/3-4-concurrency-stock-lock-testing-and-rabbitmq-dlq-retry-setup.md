---
baseline_commit: 2a7b8f6
---
# Story 3.4: Concurrency Stock Lock Testing and RabbitMQ DLQ Retry Setup

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want multi-threaded concurrency tests verifying pessimistic stock locking and RabbitMQ DLQ with exponential backoff retry configuration,
so that overselling is mathematically prevented under concurrent load and asynchronous message failures are safely routed to dead letter queues.

## Acceptance Criteria

1. **Multi-threaded Concurrency Stock Lock Integration Test (`REQ-OFL-B-303`)**:
   - Integration test class `ConcurrentStockLockIntegrationTest` created in `backend/src/test/java/com/training/starter/integration/ConcurrentStockLockIntegrationTest.java` extending `BaseIntegrationTest`.
   - Test scenario:
     - Initialize product in database with `stock = 10`.
     - Spawn 10 concurrent threads using `ExecutorService` & `CountDownLatch`.
     - Each thread attempts to place an order or decrease stock for quantity 1 of the product concurrently.
     - Verifies final product stock in database is exactly `0` without overselling (no negative stock, no deadlock, no lost updates).
     - Verifies pessimistic lock (`PESSIMISTIC_WRITE`) functions reliably under real PostgreSQL concurrency.

2. **RabbitMQ DLQ and Exponential Backoff Retry Configuration (`REQ-OFL-B-304`)**:
   - Update `RabbitMQConfig` in `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java`:
     - Define Dead Letter Exchange (`order.dlx`, DirectExchange).
     - Define Dead Letter Queue (`payment.process.dlq`).
     - Bind `payment.process.dlq` to `order.dlx` with routing key `payment.process.dlq`.
     - Configure `payment.process.queue` with `x-dead-letter-exchange: order.dlx` and `x-dead-letter-routing-key: payment.process.dlq`.
   - Configure Spring AMQP listener container factory / properties in `application.yml`:
     - Enable listener retry (`spring.rabbitmq.listener.simple.retry.enabled: true`).
     - Configure `max-attempts: 3`, `initial-interval: 1000ms`, `multiplier: 2.0`, `max-interval: 10000ms`.
   - Ensure typed `OrderCreatedEvent` (`eventId`, `orderId`, `userId`, `totalAmount`, `eventTime`, `items`) is published and consumed cleanly.

3. **RabbitMQ Failure & DLQ Integration Test (`REQ-OFL-B-304`)**:
   - Integration test class `RabbitMQDLQIntegrationTest` created in `backend/src/test/java/com/training/starter/integration/RabbitMQDLQIntegrationTest.java` extending `BaseIntegrationTest`.
   - Simulates consumer processing failure (throws exception).
   - Verifies 3 retry attempts occur with backoff and the failed message is routed to `payment.process.dlq`.

4. **Build & Verification (`REQ-OFL-B-303`, `REQ-OFL-B-304`)**:
   - Backend integration & unit test suite compiles and passes 100%.

## Tasks / Subtasks

- [x] Task 1: Implement Multi-threaded `ConcurrentStockLockIntegrationTest` (`REQ-OFL-B-303`) (AC: #1)
  - [x] Create `backend/src/test/java/com/training/starter/integration/ConcurrentStockLockIntegrationTest.java` extending `BaseIntegrationTest`.
  - [x] Write `@Test void testConcurrentStockDecrease_PreventsOverselling()` initializing stock = 10, running 10 concurrent threads, and asserting final stock == 0.

- [x] Task 2: Configure RabbitMQ DLQ & Backoff Retry Infrastructure (`REQ-OFL-B-304`) (AC: #2)
  - [x] Update `RabbitMQConfig.java` adding `ORDER_DLX`, `PAYMENT_DLQ`, `paymentDlq()`, `orderDlx()`, and updating `paymentQueue()` with DLX arguments.
  - [x] Update `application.yml` / `application-test.yml` enabling RabbitMQ listener retry with exponential backoff (max 3 attempts).

- [x] Task 3: Implement `RabbitMQDLQIntegrationTest` (`REQ-OFL-B-304`) (AC: #3)
  - [x] Create `backend/src/test/java/com/training/starter/integration/RabbitMQDLQIntegrationTest.java` extending `BaseIntegrationTest`.
  - [x] Test message failure -> retry -> routing to `payment.process.dlq`.

- [x] Task 4: Build Verification & Test Execution (AC: #4)
  - [x] Execute `cd backend && .\mvnw.cmd test -Dtest=ConcurrentStockLockIntegrationTest,RabbitMQDLQIntegrationTest,AdminDashboardServiceTest,RateLimitingFilterTest,AdminOrderServiceTest` to verify all tests pass 100%.

## Dev Notes

### Architecture & Technical Guardrails

1. **Concurrent Stock Locking Strategy**:
   - Query in `ProductRepository`: `@Lock(LockModeType.PESSIMISTIC_WRITE) Optional<Product> findByIdForUpdate(Long id);`.
   - Concurrent test executes stock reduction inside individual `@Transactional` service calls per thread.

2. **RabbitMQ DLQ Configuration**:
   - Exchange `order.dlx` (DirectExchange).
   - Queue `payment.process.dlq`.
   - Arguments on `payment.process.queue`:
     - `x-dead-letter-exchange` -> `order.dlx`
     - `x-dead-letter-routing-key` -> `payment.process.dlq`

### Source Tree Components

- `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java` [MODIFY]
- `backend/src/main/resources/application.yml` [MODIFY]
- `backend/src/main/java/com/training/starter/repository/ProductRepository.java` [MODIFY]
- `backend/src/main/java/com/training/starter/service/ProductService.java` & `ProductServiceImpl.java` [MODIFY]
- `backend/src/test/java/com/training/starter/integration/ConcurrentStockLockIntegrationTest.java` [NEW]
- `backend/src/test/java/com/training/starter/integration/RabbitMQDLQIntegrationTest.java` [NEW]

### References

- [AGENTS.md rules](file:///d:/Code/OrderFlow/AGENTS.md)
- [epics.md (Story 3.4)](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/epics.md#L150-L152)
- [stories-hoangnq17.md (Story H-14)](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/stories-hoangnq17.md#L169-L179)
- [BaseIntegrationTest.java](file:///d:/Code/OrderFlow/backend/src/test/java/com/training/starter/BaseIntegrationTest.java)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (High)

### Debug Log References

N/A

### Completion Notes List

- Added `@Lock(PESSIMISTIC_WRITE)` method `findByIdForUpdate` to `ProductRepository` and implemented `decreaseStock` in `ProductServiceImpl`.
- Created `ConcurrentStockLockIntegrationTest.java` executing 10 concurrent threads against 10 stock items, verifying exact 0 stock and 0 overselling.
- Configured RabbitMQ DLX (`order.dlx`), DLQ (`payment.process.dlq`), DLX arguments on `payment.process.queue`, and Spring AMQP listener exponential backoff retry (3 max attempts) in `RabbitMQConfig.java` and `application.yml`.
- Created `RabbitMQDLQIntegrationTest.java` verifying message publishing and routing to DLQ.
- Verified backend compilation and unit/integration test execution passed 100%.

### File List

- `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java`
- `backend/src/main/resources/application.yml`
- `backend/src/main/java/com/training/starter/repository/ProductRepository.java`
- `backend/src/main/java/com/training/starter/service/ProductService.java`
- `backend/src/main/java/com/training/starter/service/impl/ProductServiceImpl.java`
- `backend/src/test/java/com/training/starter/integration/ConcurrentStockLockIntegrationTest.java`
- `backend/src/test/java/com/training/starter/integration/RabbitMQDLQIntegrationTest.java`

