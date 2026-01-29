import { createKafkaClient, connectMongo, createElasticClient } from 'shared/db.js';
import { logger } from '../../packages/logger/index.js';

const kafka = createKafkaClient('indexing-worker');
const elastic = createElasticClient();
const consumer = kafka.consumer({ groupId: 'indexing-group' });

const run = async () => {
    await connectMongo();
    await consumer.connect();
    await consumer.subscribe({ topic: 'document-ingestion' });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const payload = JSON.parse(message.value?.toString() || '{}');
            const { id, tenant_id, content, metadata, created_at } = payload;

            logger.info({ msg: 'Processing document', id, tenant_id });

            try {
                // 1. Write to MongoDB (Source of Truth)
                const collection = (await connectMongo()).collection('documents');

                if (payload.type === 'delete') {
                    // Delete from Mongo
                    await collection.deleteOne({ id });

                    // Delete from Elastic
                    await elastic.delete({
                        index: 'documents',
                        id: id,
                        routing: tenant_id
                    });
                    logger.info({ msg: 'Deleted document', id });
                } else {
                    // Index (Default)
                    await collection.updateOne(
                        { id },
                        { $set: payload },
                        { upsert: true }
                    );

                    await elastic.index({
                        index: 'documents',
                        id: id,
                        routing: tenant_id,
                        document: {
                            tenant_id,
                            content,
                            metadata,
                            created_at
                        }
                    });
                    logger.info({ msg: 'Indexed document', id });
                }
            } catch (err) {
                logger.error({ msg: 'Error processing document', err, id });
            }
        },
    });
};

run().catch(console.error);
