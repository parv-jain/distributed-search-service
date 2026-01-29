# Walkthrough: Distributed Search Service (MVP)

**Feature**: `001-distributed-search`
**Status**: Implemented (Setup, Ingest, Search, CRUD, Isolation)

## Overview
A microservices-based search system using **Fastify**, **Kafka**, **Elasticsearch**, and **Redis**.

- **API Gateway**: Handles Auth (`X-API-Key`), Rate Limiting, and Route Proxying.
- **Indexing Worker**: Consumes Kafka `document-ingestion` topic -> MongoDB + Elasticsearch.
- **Search Service**: Internal service for executing isolated Elasticsearch queries.

## Architecture Validation

### 1. Ingestion Flow (User Story 1)
- `POST /v1/documents` sends message to Kafka.
- Worker picks it up, writes to Mongo (Source of Truth), indexes to Elastic.
- **Verification**: Check Elastic index `documents` after POST.

### 2. Search Flow (User Story 2)
- `GET /v1/search` proxies to Search Service.
- Search Service enforces `tenant_id` filter (extracted from API Key in Gateway).
- **Verification**: Search returns only documents for the used API Key.

### 3. Isolation (User Story 3)
- Middleware in Gateway resolves API Key -> Tenant ID.
- Search Service query strictly filters by this ID.
- `GET /v1/documents/:id` checks routing/ownership.

## Manual Testing Steps

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

2. **Start Services** (3 terminals):
   ```bash
   # Terminal 1
   cd services/api-gateway && npm run dev
   # Terminal 2
   cd services/search-service && npm run dev
   # Terminal 3
   cd services/indexing-worker && npm run dev
   ```

3. **Simulate Tenant**:
   ```bash
   # Set a key in Redis (simulating what Admin API would do)
   docker exec -it distributed-search-service-redis-1 redis-cli set apikey:tenant-a-key tenant-a-uuid
   ```

4. **Test Ingestion**:
   ```bash
   curl -X POST http://localhost:3000/v1/documents \
     -H "X-API-Key: tenant-a-key" \
     -H "Content-Type: application/json" \
     -d '{"content": {"title": "Test Doc", "body": "Searchable content"}}'
   ```

5. **Test Search**:
   ```bash
   curl "http://localhost:3000/v1/search?q=Searchable" -H "X-API-Key: tenant-a-key"
   # Expect: 1 hit
   ```

## Automated Tests
Contract tests available in `services/api-gateway/test/ingestion.test.ts`.
Run validaton:
```bash
cd services/api-gateway && npx tap test/ingestion.test.ts
```
