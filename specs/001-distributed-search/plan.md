# Implementation Plan: Distributed Search Service

**Branch**: `001-distributed-search` | **Date**: 2026-01-28 | **Spec**: [specs/001-distributed-search/spec.md](specs/001-distributed-search/spec.md)
**Input**: Feature specification from `specs/001-distributed-search/spec.md`

## Summary

Design and implement a distributed document search service with ingestion, search, and multi-tenancy.  
Primary requirement: Millions of documents, sub-second search, enterprise-grade architecture.  
Technical approach: Microservices (Node.js/Fastify) + Kafka (Ingestion) + Elasticsearch (Search) + MongoDB (Source) + Redis (Cache/RateLimit).

## Technical Context

**Language/Version**: Node.js 20+ (TypeScript)  
**Primary Dependencies**: Fastify, `@fastify/rate-limit`, `kafkajs`, `@elastic/elasticsearch`, `mongoose`, `ioredis`  
**Storage**: Elasticsearch (Search), MongoDB (Data), Redis (Cache)  
**Testing**: Jest (Unit), `fastify.inject` (Integration)  
**Target Platform**: Linux containers (Docker)  
**Project Type**: Microservices Monorepo  
**Performance Goals**: < 1000ms p95 search latency @ 1M docs  
**Constraints**: Logical Isolation (via API Key lookup), Async Ingestion  
**Scale/Scope**: 1M+ docs, Multi-tenant  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Code Quality**: Using TypeScript & Linting. ✅
- **II. Testing**: TDD mandated, separate integration tests aimed at APIs. ✅
- **III. User Experience**: API consistency via OpenAPI spec. ✅
- **IV. Performance**: Async ingestion and Redis caching align with performance goals. ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-distributed-search/
├── plan.md              # This file
├── research.md          # Tech decisions (Fastify, Kafka, etc.)
├── data-model.md        # Entities (Document, Tenant)
├── quickstart.md        # How to run locally
├── contracts/           # OpenAPI specs
└── tasks.md             # To be created
```

### Source Code (repository root)

```text
# Use monorepo structure
services/
├── api-gateway/         # Fastify: Auth (API Key -> Tenant Lookup), RateLimit (Redis), Routing
├── search-service/      # Fastify: Search Logic -> Elastic/Redis
└── indexing-worker/     # Node process: Kafka Consumer -> Mongo/Elastic

packages/
├── shared/              # Types, DTOs, Shared Utils
└── logger/              # Structured logging wrapper
```

## Key Implementation Details

1. **Tenant Isolation**: 
   - Fastify Middleware/Hook checks `X-API-KEY`.
   - Performs lookup (Redis/Cache) to find `tenant_id`.
   - If invalid, returns `401 Unauthorized`.
   - Propagates `tenant_id` to downstream services via internal headers.

2. **Rate Limiting**:
   - Uses `@fastify/rate-limit` with Redis store.
   - Key generator: `(req) => req.tenantId`.

3. **Search Implementation**:
   - Uses official `@elastic/elasticsearch` client.
   - Query structure: `bool` query with `must` (match query) and `filter` (term: tenant_id).

4. **Health Check**:
   - `GET /health` checks connection status of Redis, Kafka, and Elasticsearch.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Microservices | Separation of concerns (Ingest vs Search) | Monolith scales poorly for heavy ingest vs fast search. |
| Kafka | High throughput, durability | RabbitMQ less durable for massive replayable streams. |
| CQRS-ish | Write to Mongo/Elastic via Queue, Read from Elastic | Direct write to Elastic blocks API and risks data loss if Elastic is down. |
