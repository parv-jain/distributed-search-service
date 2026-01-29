# Data Model: Distributed Search Service

## Entities

### 1. Document
The core unit of data to be indexed and searched.
- **Source**: MongoDB (Authoritative), Elasticsearch (Searchable)
- **Lifecycle**: Created -> Queued -> Indexed -> {Searchable} -> Deleted

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier for the document |
| `tenant_id` | UUID | Foreign key to Tenant. Partition key. |
| `content` | String/Object | The actual data to search. |
| `metadata` | Object | Arbitrary Key-Value pairs. |
| `created_at` | ISO8601 | Timestamp of creation. |
| `updated_at` | ISO8601 | Timestamp of last update. |

### 2. Tenant
Represents a customer using the service.
- **Source**: MongoDB (Cached in Redis)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier. |
| `name` | String | Display name. |
| `api_key_hash` | String | Hashed API key for authentication. |
| `rate_limit_quota` | Integer | Requests per second allowed. |

## Storage Schemas

### MongoDB (Collection: `documents`)
```json
{
  "_id": "uuid",
  "tenant_id": "uuid(index)",
  "content": { ... },
  "metadata": { ... },
  "created_at": "date"
}
```

### Elasticsearch (Index: `documents`)
```json
{
  "mappings": {
    "properties": {
      "tenant_id": { "type": "keyword" },
      "content": { "type": "text" },
      "metadata": { "type": "object" },
      "created_at": { "type": "date" }
    }
  }
}
```
**Scaling Strategy**: The Elasticsearch index will be sharded. `tenant_id` CAN be used as a routing key to ensure tenant data stays on the same shard (optimizes search), or random routing (better load distribution). Given "Millions of documents", default routing is acceptable, but custom routing by tenant_id is better for isolation performance. **Decision**: Use `routing=tenant_id`.

## Message Payloads

### Kafka Topic: `document-ingestion`
```json
{
  "event": "DOCUMENT_CREATED",
  "payload": {
    "id": "uuid",
    "tenant_id": "uuid",
    "content": "...",
    "timestamp": "..."
  }
}
```
