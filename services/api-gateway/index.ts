import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { createRedisClient } from 'shared/db.js';
import { authMiddleware } from './auth.js';
import { ingestRoute } from './routes/ingest.js';
import { searchRoute } from './routes/search.js';
import { documentRoutes } from './routes/documents.js';

const fastify = Fastify({ logger: true });
const redis = createRedisClient();

// Rate Limiting
await fastify.register(rateLimit, {
    global: false, // We apply it to specific routes or globally with a default
    max: 100, // Default quota
    timeWindow: '1 minute',
    redis,
    keyGenerator: (req) => {
        return req.tenantId || req.ip; // Fallback to IP if no tenant (though auth catches that)
    },
    errorResponseBuilder: (req, context) => {
        return {
            statusCode: 429,
            error: 'Too Many Requests',
            message: `Rate limit exceeded, retry in ${context.after}ms`
        };
    }
});

// Auth Hook
fastify.addHook('onRequest', async (req, reply) => {
    // Skip auth for health/public routes if needed, otherwise apply globally
    if (req.url !== '/health') {
        await authMiddleware(req, reply);
    }
});

fastify.register(ingestRoute);
fastify.register(searchRoute);
fastify.register(documentRoutes);

// Health Check
fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date() };
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
