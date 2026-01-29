import type { FastifyInstance } from 'fastify';
import axios from 'axios'; // Quick proxy
import { logger } from '../../../packages/logger/index.js';

export async function searchRoute(fastify: FastifyInstance) {
    fastify.get('/v1/search', async (req, reply) => {
        const { q } = req.query as any;

        if (!q) {
            return reply.code(400).send({ error: 'Missing query parameter q' });
        }

        if (!req.tenantId) {
            return reply.code(401).send();
        }

        try {
            // Call Search Service (Internal)
            const response = await axios.post('http://localhost:3002/search', {
                q,
                tenant_id: req.tenantId
            });

            return response.data;
        } catch (err) {
            logger.error(err);
            return reply.code(500).send({ error: 'Search failed' });
        }
    });
}
