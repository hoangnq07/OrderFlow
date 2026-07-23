---
baseline_commit: 2040b5a
---
# Story 5.3: System Architecture Documentation and Live Demo Presentation

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a development team,
I want to update system architecture documentation in `README.md` and prepare live demo presentation guides,
so that project architecture, local setup instructions, API endpoints, and live demo flows are thoroughly documented and ready for evaluation.

## Acceptance Criteria

1. **System Architecture & Service URLs Documentation (`REQ-OFL-W-405`)**:
   - Verify `README.md` includes system architecture description, Docker Compose services (PostgreSQL, Redis, RabbitMQ, MailHog), and service URLs.
   - Document quick start guide: infrastructure startup (`docker compose up -d`), backend startup (`.\mvnw.cmd spring-boot:run`), frontend startup (`npm start`), and test commands.

2. **API & Feature Coverage Documentation (`REQ-OFL-W-405`)**:
   - Document domain endpoints: Product Catalog, Redis Cart, Order Placement with Pessimistic Stock Locking, Async RabbitMQ processing, API Rate Limiting, Admin Order Management, and Analytics Dashboard.

3. **Live Demonstration Guidance & Checklist (`REQ-OFL-W-406`)**:
   - Provide step-by-step live demo script (15-20 minutes):
     1. System overview & tech stack presentation.
     2. Customer flow demo (Register -> Login -> Browse catalog -> Add to cart -> Checkout -> Email notification).
     3. Admin flow demo (Dashboard metrics, product management, order status update).
     4. Architecture walkthrough (Pessimistic locking, Redis hash cart, RabbitMQ DLQ retry policy).

## Tasks / Subtasks

- [x] Task 1: Audit and Update README System Documentation (`REQ-OFL-W-405`) (AC: #1, #2)
  - [x] Verify `README.md` setup instructions, service ports, and architecture details.

- [x] Task 2: Prepare Live Demo Walkthrough Guide (`REQ-OFL-W-406`) (AC: #3)
  - [x] Document 15-20 minute live demo structure and presentation flow in project documentation.

## Dev Notes

### Architecture & Technical Guardrails

- `README.md` serves as primary setup & architecture reference.
- Presentation flow covers full E2E user lifecycle and key technical challenges (concurrency locking, Redis cart, RabbitMQ DLQ).

### References

- [AGENTS.md rules](file:///d:/Code/OrderFlow/AGENTS.md)
- [README.md](file:///d:/Code/OrderFlow/README.md)
- [epics.md (Story 5.3)](file:///d:/Code/OrderFlow/_bmad-output/planning-artifacts/epics.md#L180-L182)

## Dev Agent Record

### Agent Model Used

Gemini 3.6 Flash (High)

### Debug Log References

N/A

### Completion Notes List

- Updated `README.md` with complete OrderFlow architecture, domain feature mapping, service URL table, and quick start guide.
- Prepared 15-20 minute live demo checklist for presentation evaluation.

### File List

- `README.md`
- `_bmad-output/implementation-artifacts/5-3-system-architecture-documentation-and-live-demo-presentation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
