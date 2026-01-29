---
description: "Task list template for feature implementation"
---

# Tasks: Distributed Search Service

**Input**: Design documents from `/specs/001-distributed-search/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD is mandatory per Constitution. Tests are included for each story.

**Organization**: Tasks are grouped by user story (P1, P1, P2, P3).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure (monorepo root, packages/, services/)
- [x] T002 Initialize `docker-compose.yml` with MongoDB, Elasticsearch, Redis, Kafka, Zookeeper
- [x] T003 Initialize shared package `packages/shared` (TS config, base types)
- [x] T004 Initialize logger package `packages/logger` (Pino/Winston wrapper)
- [x] T005 Initialize `services/api-gateway` (Fastify + TypeScript)
- [x] T006 Initialize `services/search-service` (Fastify + TypeScript)
- [x] T007 Initialize `services/indexing-worker` (Node.js + TypeScript)
- [x] T008 Configure monorepo workspace (pnpm-workspace.yaml)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T009 Create Tenant/Document DTOs and Interfaces in `packages/shared`
- [x] T010 [P] Implement Redis Client wrapper in `packages/shared`
- [x] T011 [P] Implement MongoDB Client connection in `packages/shared`
- [x] T012 [P] Implement Elasticsearch Client connection in `packages/shared`
- [x] T013 [P] Implement Kafka Producer/Consumer wrappers in `packages/shared`
- [x] T014 Implement Authentication Middleware in `services/api-gateway` (X-API-KEY -> Redis Lookup)
- [x] T015 Implement Rate Limiting plugin setup in `services/api-gateway` (@fastify/rate-limit + Redis)
- [x] T016 Implement Health Check endpoint (`GET /health`) in `services/api-gateway`

**Checkpoint**: Infrastructure ready. Services can talk to DBs/Queue. Auth/RateLimit ready.

---

## Phase 3: User Story 1 - Document Ingestion (Priority: P1) 🎯 MVP

**Goal**: Ingest documents via API, queue them, and store/index them.

**Independent Test**: POST /v1/documents -> 202 -> Document appears in Mongo & Elastic.

### Tests for User Story 1
- [x] T017 [US1] Create contract test for `POST /v1/documents` in `services/api-gateway/test/ingestion.test.ts`
- [ ] T018 [US1] Create integration test for Indexing Worker in `services/indexing-worker/test/worker.test.ts`

### Implementation for User Story 1
- [x] T019 [US1] Implement `POST /v1/documents` route in `services/api-gateway` (Producer to Kafka)
- [x] T020 [US1] Implement Worker Consumer logic in `services/indexing-worker` (Consume `document-ingestion`)
- [x] T021 [US1] Implement MongoDB Write logic in `services/indexing-worker`
- [x] T022 [US1] Implement Elasticsearch Indexing logic in `services/indexing-worker`
- [ ] T023 [US1] Docker Compose: Verify Kafka topic creation and flow

**Checkpoint**: Documents flow from API -> Kafka -> Worker -> DBs.

---

## Phase 4: User Story 2 - High-Performance Search (Priority: P1)

**Goal**: Search documents with sub-second latency via dedicated search service.

**Independent Test**: GET /v1/search -> Results from Elastic.

### Tests for User Story 2
- [ ] T024 [US2] Create contract test for `GET /v1/search` in `services/api-gateway/test/search.test.ts`
- [ ] T025 [US2] Create unit tests for Search Logic (Query Builder) in `services/search-service/test/builder.test.ts`

### Implementation for User Story 2
- [x] T026 [US2] Implement Search Logic (Elasticsearch Query with Tenant Filter) in `services/search-service`
- [x] T027 [US2] Implement Internal API `POST /search` (or similar) in `services/search-service`
- [x] T028 [US2] Implement `GET /v1/search` in `services/api-gateway` (Proxy/Call `search-service`)
- [x] T029 [US2] Implement `GET /v1/documents/:id` and `DELETE /v1/documents/:id` in `services/api-gateway` & `services/search-service`

**Checkpoint**: Full search and CRUD capability.

---

## Phase 5: User Story 3 - Multi-Tenancy Isolation (Priority: P2)

**Goal**: Ensure strict data isolation between tenants.

**Independent Test**: Verify Tenant A cannot see Tenant B's data.

### Tests for User Story 3
- [ ] T030 [US3] Create isolation test suite in `tests/integration/isolation.test.ts`

### Implementation for User Story 3
- [x] T031 [US3] Audit and enforce `tenant_id` filter in ALL Elasticsearch queries in `services/search-service`
- [x] T032 [US3] Enforce `tenant_id` check in `GET/DELETE /documents/:id` (Ensure ownership)
- [ ] T033 [US3] Verify Rate Limits are applied per-tenant (Integration check)

**Checkpoint**: Security and Isolation verified.

---

## Phase 6: User Story 4 - Fault Tolerance & Scalability (Priority: P3)

**Goal**: System stays up during node failures.

### Tests for User Story 4
- [ ] T034 [US4] Create chaos test script (kill worker, send docs)

### Implementation for User Story 4
- [ ] T035 [US4] Implement Retry Policy for Kafka Consumer in `services/indexing-worker`
- [ ] T036 [US4] Implement Graceful Shutdown in all services (Close DB/Queue connections)

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T037 Update `README.md` with startup instructions
- [ ] T038 Add Seed Script for creating Tenants (for `POST /admin/tenants` simulation)
- [ ] T039 Finalize OpenAPI documentation (Serve Swagger UI)

---

## Dependencies & Execution Order

1. **Setup & Foundation**: Blocks everything.
2. **US1 (Ingest)**: Blocks US2 (Need data to search).
3. **US2 (Search)**: Blocks US3 (Need search to verify isolation).
4. **US3 (Isolation)**: Can be done parallel with US4, but best sequential for correctness.
5. **US4 (Resilience)**: Final hardening.

## Implementation Strategy

1. **MVP**: Setup + Foundation + US1 + US2. (Ingest & Search).
2. **Release 1**: MVP + US3 (Isolation verified).
3. **Release 2**: Release 1 + US4 (Enterprise ready).
