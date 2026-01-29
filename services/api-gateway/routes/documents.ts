import type { FastifyInstance } from 'fastify';
import { createElasticClient, createKafkaClient } from 'shared/db.js';
import { logger } from '../../../packages/logger/index.js';

const elastic = createElasticClient();
const kafka = createKafkaClient('api-gateway');
const producer = kafka.producer();
await producer.connect();

export async function documentRoutes(fastify: FastifyInstance) {

    // GET /v1/documents/:id
    fastify.get('/v1/documents/:id', async (req, reply) => {
        const { id } = req.params as any;

        if (!req.tenantId) return reply.code(401).send();

        try {
            const result = await elastic.get({
                index: 'documents',
                id: id,
                routing: req.tenantId // Mandatory: optimization + access check implied if routing matches
            });

            // Strict Ownership Check (if routing isn't enough or if we want logic assurance)
            if (result._source && (result._source as any).tenant_id !== req.tenantId) {
                // Should not happen if routing is tenant_id, but safety first
                return reply.code(404).send(); // Don't verify existence of other tenant docs
            }

            return result._source;
        } catch (err: any) {
            if (err.meta && err.meta.statusCode === 404) {
                return reply.code(404).send({ error: 'Document not found' });
            }
            logger.error(err);
            return reply.code(500).send({ error: 'Retrieval failed' });
        }
    });

    // DELETE /v1/documents/:id
    fastify.delete('/v1/documents/:id', async (req, reply) => {
        const { id } = req.params as any;

        if (!req.tenantId) return reply.code(401).send();

        try {
            await producer.send({
                topic: 'document-ingestion',
                messages: [
                    {
                        key: req.tenantId,
                        value: JSON.stringify({
                            type: 'delete',
                            id: id,
                            tenant_id: req.tenantId,
                            created_at: new Date().toISOString()
                        })
                    }
                ]
            });
            return reply.code(202).send({ status: 'deletion_queued' });
        } catch (err: any) {
            logger.error(err);
            return reply.code(500).send({ error: 'Deletion failed' });
        }
    });
}
