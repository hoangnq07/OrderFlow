# Story 1.1: Entity Migration Setup for Category and Product

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want to create Category & Product JPA Entities and Flyway V2 migrations,
so that the base catalog data model is available.

## Acceptance Criteria

1. Entities Category and Product compiled without errors and mapped to DB fields correctly.
2. Flyway migration V2 executes successfully on PostgreSQL.
3. Base repositories and initial service layer CRUD logic using MapStruct are implemented.

## Tasks / Subtasks

- [x] Define `Category` and `Product` JPA entities extending `BaseEntity`. (AC: 1)
  - [x] Create Category entity with name and slug.
  - [x] Create Product entity with name, slug, description, price, stock, category relationship (Lazy), imageUrl, active, and version (optimistic locking).
- [x] Write Flyway migration V2 for `categories` and `products` tables. (AC: 2)
  - [x] Add tables mapping precisely to Category and Product JPA models.
  - [x] Add `search_vector TSVECTOR` to `products` table for full-text search capability.
- [x] Implement base repositories and initial service layer CRUD logic using MapStruct. (AC: 3)
  - [x] Create CategoryRepository and ProductRepository.
  - [x] Create CategoryMapper and ProductMapper using MapStruct.
  - [x] Create CategoryService / ProductService and their implementations.

## Dev Notes

- **Java Version**: Java 17 language features are utilized.
- **Dependency Injection**: Constructor injection is enforced exclusively (no `@Autowired` fields).
- **JPA Inheritance**: Entities inherit from `BaseEntity` (providing common fields like id, created_at, updated_at).
- **Data Types**: `BigDecimal` is used for money/prices to avoid floating point precision issues.
- **Validation & Constraints**: Slug is unique and not null; stock defaults to 0 and must not be negative.
- **Database & Flyway**: Table names are lowercase and plural (`categories`, `products`). Foreign keys link products to categories.

### Project Structure Notes

- Entities: `com.training.starter.entity`
- Repositories: `com.training.starter.repository`
- Mappers: `com.training.starter.mapper`
- Services: `com.training.starter.service` and `com.training.starter.service.impl`
- Migration location: `backend/src/main/resources/db/migration/V2__create_product_tables.sql`

### References

- [Project 1 - OrderFlow.md](file:///d:/Code/OrderFlow/Project%201%20-%20OrderFlow.md)
- [AGENTS.md](file:///d:/Code/OrderFlow/AGENTS.md)
- [prd.md](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/prd-orderflow/prd.md)
- [stories-hoangnq17.md](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/stories-hoangnq17.md)

## Dev Agent Record

### Agent Model Used

Gemini 3.5 Flash (High)

### Debug Log References

- N/A

### Completion Notes List

- Database schema created successfully using Flyway migration `V2__create_product_tables.sql`.
- Category and Product models implemented with Lombok, JPA annotations, and standard mappings.
- Repositories and Mapper classes configured.
- CategoryService and ProductService base CRUD services implemented.

### File List

- [Category.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/entity/Category.java)
- [Product.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/entity/Product.java)
- [CategoryRepository.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/repository/CategoryRepository.java)
- [ProductRepository.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/repository/ProductRepository.java)
- [CategoryMapper.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/mapper/CategoryMapper.java)
- [ProductMapper.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/mapper/ProductMapper.java)
- [CategoryService.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/service/CategoryService.java)
- [ProductService.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/service/ProductService.java)
- [CategoryServiceImpl.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/service/impl/CategoryServiceImpl.java)
- [ProductServiceImpl.java](file:///d:/Code/OrderFlow/backend/src/main/java/com/training/starter/service/impl/ProductServiceImpl.java)
- [V2__create_product_tables.sql](file:///d:/Code/OrderFlow/backend/src/main/resources/db/migration/V2__create_product_tables.sql)
