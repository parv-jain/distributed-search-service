# Research: Distributed Search Service
**Feature**: 001-distributed-search
**Date**: 2026-01-28

## Decisions

### 1. Message Queue: Apache Kafka
- **Decision**: Use **Apache Kafka**.
- **Rationale**: The requirement is for a "distributed" service capable of "millions of documents". Kafka provides better horizontal scalability for ingestion.
- **Alternatives**: RabbitMQ.

### 2. Source of Truth Database: MongoDB
- **Decision**: Use **MongoDB**.
- **Rationale**: Native JSON store fits the "Document" model perfectly.
- **Alternatives**: PostgreSQL.

### 3. API Gateway & Web Framework: Fastify
- **Decision**: Use **Fastify** with `@fastify/rate-limit`.
- **Rationale**: User requested Fastify for performance. Fastify allows better throughput than Express. We will use the official `@fastify/rate-limit` plugin backed by Redis.
- **Alternatives**: Express (Slower, but requested earlier), NestJS.

### 4. Search Engine: Elasticsearch
- **Decision**: Use **Elasticsearch** (Official Client).
- **Rationale**: Mandated by user. We will use the official `@elastic/elasticsearch` client.

### 5. Multi-Tenancy: API Key Lookup
- **Decision**: Use `X-API-KEY` header.
- **Rationale**: The system must look up the Tenant ID associated with the provided API Key.
- **Implementation**: Middleware validates `X-API-KEY`, looks up `tenant_id` from Redis/Mongo, and attaches it to the request context.

## Unknowns Resolved
- **Tech Stack**: Node.js, Fastify, Kafka, MongoDB, Redis, Elasticsearch.
- **Testing**: Jest, Supertest (or fastify.inject).
