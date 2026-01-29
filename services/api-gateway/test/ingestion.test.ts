import { test } from 'tap';
import Fastify from 'fastify';
import { authMiddleware } from '../auth.js';
import { ingestRoute } from '../routes/ingest.js';

// Mock dependencies
// ... setup mocks ...

test('POST /v1/documents', async (t) => {
    const fastify = Fastify();
    // Register routes/plugins
    // ...

    const response = await fastify.inject({
        method: 'POST',
        url: '/v1/documents',
        headers: { 'x-api-key': 'test-key' },
        payload: { content: { foo: 'bar' } }
    });

    t.equal(response.statusCode, 202);
});
