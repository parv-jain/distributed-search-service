import type { FastifyRequest, FastifyReply } from 'fastify';
import { createRedisClient } from 'shared/db.js';
import type { TenantDTO } from 'shared/types.js';

const redis = createRedisClient();

// Add tenantId to Fastify Request type
declare module 'fastify' {
    interface FastifyRequest {
        tenantId?: string;
    }
}

export const authMiddleware = async (req: FastifyRequest, reply: FastifyReply) => {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
        return reply.code(401).send({ error: 'Missing X-API-KEY header' });
    }

    // Lookup tenant from Redis
    // Key structure: "apikey:<hash>" -> "tenant_id"
    const tenantId = await redis.get(`apikey:${apiKey}`);

    if (!tenantId) {
        return reply.code(401).send({ error: 'Invalid API Key' });
    }

    req.tenantId = tenantId;
};
