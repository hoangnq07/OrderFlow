# Story 2.5: postgresql-full-text-search-and-redis-product-detail-cache

Status: done

## Story

As a developer / system,
I want Redis product detail caching with `@Cacheable` and `@CacheEvict` in `ProductServiceImpl`, and Redis `CacheManager` with 30-minute TTL,
so that repeated requests to `GET /api/v1/products/{id}` hit Redis cache and product updates/deletions immediately invalidate stale cache entries.

## Acceptance Criteria

1. **Redis Cache Manager Configuration (`REQ-OFL-B-210`, `AGENTS.md Rule 15`)**:
   - Add `CacheManager` bean in `backend/src/main/java/com/training/starter/config/RedisConfig.java` using `RedisCacheManager.builder(...)`.
   - Set default cache TTL to **30 minutes** (1800 seconds).
   - Configure key serialization with `StringRedisSerializer` and value serialization with `GenericJackson2JsonRedisSerializer`.

2. **Product Detail `@Cacheable` (`REQ-OFL-B-210`, `AGENTS.md Rule 15`)**:
   - Annotate `ProductServiceImpl.getById(Long id)` with `@Cacheable(value = "products", key = "#id")`.
   - Returns `ProductResponse` from Redis cache on subsequent calls without querying PostgreSQL DB.

3. **Cache Invalidation on Update & Delete (`REQ-OFL-B-210`, `AGENTS.md Rule 15`)**:
   - Annotate `ProductServiceImpl.update(Long id, UpdateProductRequest request)` with `@CacheEvict(value = "products", key = "#id")`.
   - Annotate `ProductServiceImpl.delete(Long id)` with `@CacheEvict(value = "products", key = "#id")`.
   - Invalidation removes product cache entry immediately upon mutation or soft deletion.

4. **Unit Tests & Verification**:
   - Update/Add `ProductServiceTest` unit test verifying `@Cacheable` and `@CacheEvict` behavior.
   - 100% pass rate on `mvnw test`.

## Tasks / Subtasks

- [x] Task 1: Configure Redis CacheManager with 30-min TTL (AC: #1)
  - [x] Add `CacheManager cacheManager(...)` bean in `RedisConfig.java`.

- [x] Task 2: Add Spring Cache Annotations to `ProductServiceImpl` (AC: #2, #3)
  - [x] Add `@Cacheable(value = "products", key = "#id")` to `getById`.
  - [x] Add `@CacheEvict(value = "products", key = "#id")` to `update` and `delete`.

- [x] Task 3: Write Cache Invalidation Unit Tests & Verify (AC: #4)
  - [x] Verify `ProductServiceTest` passes 100% with `mvnw test`.

## Dev Notes

- **Architecture & Conventions**:
  - Cache name: `products`. Key: `#id`.
  - TTL: 30 minutes (`Duration.ofMinutes(30)`).
  - Cache abstraction: Spring `@Cacheable`, `@CacheEvict`.

- **Source Tree Components Touched / Created**:
  - [MODIFY] `backend/src/main/java/com/training/starter/config/RedisConfig.java`
  - [MODIFY] `backend/src/main/java/com/training/starter/service/impl/ProductServiceImpl.java`

### References

- [AGENTS.md Rule 15 (Cache Rules)](file:///d:/OJT/OrderFlow/AGENTS.md#L170-L180)
- [Task Backlog D-10](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/tasks-duandh3.md#L127-L136)
- [Epic Breakdown Story 2.5](file:///d:/OJT/OrderFlow/_bmad-output/planning-artifacts/epics.md#L132-L134)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (Medium)

### Debug Log References

N/A

### Completion Notes List

- Configured `CacheManager` bean in `RedisConfig.java` with 30-minute default TTL (`Duration.ofMinutes(30)`) and Jackson JSON serializers (`AGENTS.md Rule 15`).
- Annotated `ProductServiceImpl.getById(Long id)` with `@Cacheable(value = "products", key = "#id")`.
- Annotated `ProductServiceImpl.update` and `delete` with `@CacheEvict(value = "products", key = "#id")`.
- Verified backend test suite with `mvnw test` (51/51 total unit tests passed 100%).

### File List

- `backend/src/main/java/com/training/starter/config/RedisConfig.java`
- `backend/src/main/java/com/training/starter/service/impl/ProductServiceImpl.java`
- `_bmad-output/implementation-artifacts/2-5-postgresql-full-text-search-and-redis-product-detail-cache.md`
