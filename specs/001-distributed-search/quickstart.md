# Quickstart: Distributed Search Service

## Prerequisites
- Node.js (LTS)
- Docker & Docker Compose
- pnpm (recommended)

## Setup
1. **Clone the repository**:
   ```bash
   git clone ...
   cd distributed-search-service
   ```

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Start Infrastructure**:
   This spins up MongoDB, Elasticsearch, Redis, Kafka, and Zookeeper.
   ```bash
   docker-compose up -d
   ```

4. **Run Services**:
   In separate terminals:
   
   *API Gateway & Search Service*
   ```bash
   cd services/api-gateway
   pnpm dev
   ```
   
   *Indexing Worker*
   ```bash
   cd services/indexing-worker
   pnpm dev
   ```

## Usage

### 1. Check Health
```bash
curl http://localhost:3000/health
# Expect: {"status":"ok","dependencies":{...}}
```

### 2. Create a Tenant (Seed)
```bash
curl -X POST http://localhost:3000/admin/tenants -d '{"name": "Demo Corp"}'
# Keep the returned API Key
```

### 3. Ingest Document
```bash
curl -X POST http://localhost:3000/v1/documents \
  -H "X-API-Key: <YOUR_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"content": {"title": "Hello World", "body": "This is a distributed search test."}}'
# Returns {"id": "UUID", ...}
```

### 4. Search
```bash
curl "http://localhost:3000/v1/search?q=distributed" \
  -H "X-API-Key: <YOUR_KEY>"
```

### 5. Retrieve Document
```bash
curl "http://localhost:3000/v1/documents/<DOC_ID>" \
  -H "X-API-Key: <YOUR_KEY>"
```

### 6. Delete Document
```bash
curl -X DELETE "http://localhost:3000/v1/documents/<DOC_ID>" \
  -H "X-API-Key: <YOUR_KEY>"
```
