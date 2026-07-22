# Story 2.3: customer-order-ui-and-rabbitmq-event-infrastructure

Status: done

## Story

As a developer / system,
I want RabbitMQ Topic Exchange (`order.exchange`), Queues (`payment.process.queue`, `notification.email.queue`), typed `OrderCreatedEvent` DTO, and an `OrderEventPublisher` component,
so that order creation events are routed asynchronously to payment processing and notification queues.

## Acceptance Criteria

1. **Typed Event DTO (`REQ-OFL-B-207`, `AGENTS.md Rule 14`)**:
   - Create `OrderCreatedEvent` record/class in `backend/src/main/java/com/training/starter/event/OrderCreatedEvent.java`.
   - Includes: `String eventId` (UUID string), `Long orderId`, `Long userId`, `BigDecimal totalAmount`, `LocalDateTime eventTime`, `List<OrderItemInfo> items`.
   - `OrderItemInfo` record containing `Long productId`, `String productName`, `BigDecimal unitPrice`, `Integer quantity`, `BigDecimal subtotal`.

2. **RabbitMQ Topic Exchange, Queues & Bindings (`REQ-OFL-B-207`)**:
   - Update `RabbitMQConfig` in `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java`:
     - Topic Exchange: `order.exchange` (`ORDER_EXCHANGE = "order.exchange"`)
     - Queues: `payment.process.queue` (`PAYMENT_QUEUE = "payment.process.queue"`) and `notification.email.queue` (`NOTIFICATION_QUEUE = "notification.email.queue"`)
     - Routing Key: `order.created` (`ORDER_CREATED_ROUTING_KEY = "order.created"`)
     - Bindings: Bind `payment.process.queue` to `order.exchange` with routing key `order.created`, bind `notification.email.queue` to `order.exchange` with routing key `order.created`.
     - Configures `Jackson2JsonMessageConverter` bean for automatic JSON event payload serialization.

3. **OrderEventPublisher Component (`REQ-OFL-B-207`)**:
   - Create `OrderEventPublisher` in `backend/src/main/java/com/training/starter/publisher/OrderEventPublisher.java`.
   - Injects `RabbitTemplate`.
   - Implements `publishOrderCreatedEvent(OrderCreatedEvent event)` publishing `event` to `order.exchange` using routing key `order.created`.

4. **Unit Tests & Verification**:
   - Unit test `OrderEventPublisherTest` created in `backend/src/test/java/com/training/starter/publisher/OrderEventPublisherTest.java` verifying `rabbitTemplate.convertAndSend` parameter matching.
   - 100% pass rate on `mvnw test`.

## Tasks / Subtasks

- [x] Task 1: Create Typed `OrderCreatedEvent` DTO (AC: #1)
  - [x] Create `backend/src/main/java/com/training/starter/event/OrderCreatedEvent.java`.

- [x] Task 2: Configure RabbitMQ Exchanges, Queues, and Bindings (AC: #2)
  - [x] Update `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java`.
  - [x] Define `orderExchange`, `paymentQueue`, `notificationQueue`, and bindings with `order.created` routing key.
  - [x] Configure `Jackson2JsonMessageConverter`.

- [x] Task 3: Implement `OrderEventPublisher` (AC: #3)
  - [x] Create `backend/src/main/java/com/training/starter/publisher/OrderEventPublisher.java`.
  - [x] Implement `publishOrderCreatedEvent(OrderCreatedEvent event)`.

- [x] Task 4: Write `OrderEventPublisherTest` & Verify (AC: #4)
  - [x] Create `backend/src/test/java/com/training/starter/publisher/OrderEventPublisherTest.java`.
  - [x] Run `.\mvnw.cmd test` in `backend/` to verify tests pass 100%.

## Dev Notes

- **Architecture & Conventions**:
  - RabbitMQ exchange name: `order.exchange` (Topic).
  - Queues: `payment.process.queue` and `notification.email.queue`.
  - Routing key: `order.created`.
  - Event payload: `OrderCreatedEvent` DTO (never JPA entity).
  - Jackson serialization: `Jackson2JsonMessageConverter`.

- **Source Tree Components Touched / Created**:
  - [NEW] `backend/src/main/java/com/training/starter/event/OrderCreatedEvent.java`
  - [NEW] `backend/src/main/java/com/training/starter/publisher/OrderEventPublisher.java`
  - [NEW] `backend/src/test/java/com/training/starter/publisher/OrderEventPublisherTest.java`
  - [MODIFY] `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java`

### References

- [AGENTS.md Rule 14 (RabbitMQ Rules)](file:///d:/OJT/OrderFlow/AGENTS.md#L150-L168)
- [Task Backlog D-08](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md#L102-L111)
- [Epic Breakdown Story 2.3](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/epics.md#L126-L128)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (Medium)

### Debug Log References

N/A

### Completion Notes List

- Authored `OrderCreatedEvent.java` typed event DTO following AGENTS.md Rule 14.
- Updated `RabbitMQConfig.java` configuring `order.exchange` TopicExchange, `payment.process.queue`, `notification.email.queue`, and `order.created` routing key bindings.
- Created `OrderEventPublisher` Spring component publishing events via `RabbitTemplate`.
- Created `OrderEventPublisherTest.java` verifying event publication via Mockito.
- Verified backend test suite with `mvnw test` (49/49 tests passed 100%).

### File List

- `backend/src/main/java/com/training/starter/event/OrderCreatedEvent.java`
- `backend/src/main/java/com/training/starter/config/RabbitMQConfig.java`
- `backend/src/main/java/com/training/starter/publisher/OrderEventPublisher.java`
- `backend/src/test/java/com/training/starter/publisher/OrderEventPublisherTest.java`
- `_bmad-output/implementation-artifacts/2-3-customer-order-ui-and-rabbitmq-event-infrastructure.md`
