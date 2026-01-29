# Distributed Search Service

## Running the Service

1. **Start Infrastructure**:
   ```bash
   docker-compose up -d
   ```

2. **Start Services**:
   Open 3 terminals:
   
   *API Gateway*
   ```bash
   cd services/api-gateway && npm run dev
   ```

   *Search Service*
   ```bash
   cd services/search-service && npm run dev
   ```

   *Indexing Worker*
   ```bash
   cd services/indexing-worker && npm run dev
   ```

## API Usage

1. **Seed Tenant & Get Key**: (Manually insert into Redis for MVP)
   ```bash
   redis-cli set apikey:test-key tenant-uuid-123
   ```

2. **Ingest Document**:
   ```bash
   curl -X POST http://localhost:3000/v1/documents \
     -H "X-API-Key: test-key" \
     -H "Content-Type: application/json" \
     -d '{"content": {"title": "Hello World"}}'
   ```

3. **Search**:
   ```bash
   curl "http://localhost:3000/v1/search?q=Hello" -H "X-API-Key: test-key"
   ```

4. **Get Document**:
   ```bash
   # Replace {id} with the ID returned from Ingest
   curl "http://localhost:3000/v1/documents/{id}" -H "X-API-Key: test-key"
   ```

5. **Delete Document**:
   ```bash
   # Replace {id} with the ID to delete
   curl -X DELETE "http://localhost:3000/v1/documents/{id}" -H "X-API-Key: test-key"
   ```
