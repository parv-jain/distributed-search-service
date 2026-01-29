import type { FastifyInstance } from 'fastify';
import { createKafkaClient } from 'shared/db.js';

const kafka = createKafkaClient('api-gateway');
const producer = kafka.producer();

// Connect producer on startup (in a real app, handle lifecycle better)
await producer.connect();

export async function ingestRoute(fastify: FastifyInstance) {
    fastify.post('/v1/documents', async (req, reply) => {
        const { content, metadata } = req.body as any;
        const documentId = crypto.randomUUID();

        if (!req.tenantId) {
            return reply.code(401).send();
        }

        await producer.send({
            topic: 'document-ingestion',
            messages: [
                {
                    key: req.tenantId, // Use tenantId as partitioning key
                    value: JSON.stringify({
                        type: 'index',
                        id: documentId,
                        tenant_id: req.tenantId,
                        content,
                        metadata,
                        created_at: new Date().toISOString()
                    })
                }
            ]
        });

        reply.code(202).send({ id: documentId, status: 'queued' });
    });
}
