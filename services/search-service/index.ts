import Fastify from 'fastify';
import { createElasticClient } from 'shared/db.js';

const fastify = Fastify({ logger: true });
const elastic = createElasticClient();

// Internal API - Trusted Caller (Gateway)
fastify.post('/search', async (req, reply) => {
    const { q, tenant_id } = req.body as any;

    if (!tenant_id) {
        return reply.code(400).send({ error: 'Missing tenant_id context' });
    }

    try {
        const result = await elastic.search({
            index: 'documents',
            body: {
                query: {
                    bool: {
                        must: [
                            { multi_match: { query: q, fields: ['content.*'] } }
                        ],
                        filter: [
                            { term: { "tenant_id.keyword": tenant_id } } // Mandatory Isolation
                        ]
                    }
                }
            } as any
        });

        const hits = result.hits.hits.map((h: any) => ({
            id: h._id,
            ...h._source
        }));

        return { total: result.hits.total, hits };
    } catch (err) {
        fastify.log.error(err);
        return reply.code(500).send({ error: 'Search failed' });
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3002, host: '0.0.0.0' }); // Internal port
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();
