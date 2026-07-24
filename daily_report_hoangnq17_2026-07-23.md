# Daily Report — HoangNQ17 — 2026-07-23
 
## Team: Team 1 | Project: OrderFlow
 
### What I did today
- [x] Fix & Complete REQ-OFL-B-204 & REQ-OFL-F-201: Fixed HTTP 500 Redis Jackson deserialization issue on cart operations and connected front-end Checkout modal dialog to backend `POST /api/v1/orders` API.
- [x] Fix & Complete REQ-OFL-F-202 & REQ-OFL-F-203: Fixed missing customer order tracking UI by creating `OrderListComponent` (`/orders`) and `OrderDetailComponent` (`/orders/:id`) with status badges.
- [x] Fix REQ-OFL-B-203: Ensured pessimistic stock locking (`PESSIMISTIC_WRITE`) sorts product IDs ascending in `OrderServiceImpl` to prevent database deadlocks under concurrent ordering.
- [x] Fix & Align REQ-OFL-F-204: Added `searchProducts()` method in `ProductService` to map front-end catalog search with PostgreSQL `tsvector` full-text search endpoint.
- [x] Test & Verify REQ-OFL-T-201: Created `OrderServiceTest` unit test suite (4 unit tests), bringing total backend test count to 65 unit tests (100% PASS).
- [x] Documentation & Seed Data: Updated system architecture docs, sequence diagrams, API documentation, deployment guides, and Flyway V5 sample seed data.
 
### What I learned
- Identified root cause of Jackson `InvalidTypeIdException` with Java `record` types when using `GenericJackson2JsonRedisSerializer` in Spring Data Redis, resolving it by removing `activateDefaultTyping(NON_FINAL)`.
- Discovered gaps between frontend routing and backend order APIs, learning the importance of end-to-end integration audits before milestone completion.
 
### Blockers / Questions
- None. All 65 backend unit tests pass (`BUILD SUCCESS`) and Angular frontend builds cleanly with 0 errors.
 
### Plan for tomorrow
- [ ] REQ-OFL-T-301: Write integration tests using Testcontainers for PostgreSQL, Redis, and RabbitMQ end-to-end flows.
- [ ] REQ-OFL-T-302: Execute multi-threaded concurrency stock test with 10 threads purchasing the same product to verify 0 overselling under load.
- [ ] REQ-OFL-W-406: Conduct dry run of the 15-minute live demo presentation using the prepared demo guide script.
 
### Code references
- PR: https://github.com/hoangnq07/OrderFlow/pull/new/feature/OFL-504-customer-checkout-and-order-tracking
- Branch: `feature/OFL-504-customer-checkout-and-order-tracking`
