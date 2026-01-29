import { Redis } from 'ioredis';
import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import { Kafka } from 'kafkajs';

// Redis
export const createRedisClient = (url: string = process.env.REDIS_URL || 'redis://localhost:6379') => {
    return new Redis(url);
};

// MongoDB
export const connectMongo = async (uri: string = process.env.MONGO_URI || 'mongodb://localhost:27017/search') => {
    await mongoose.connect(uri);
    return mongoose.connection;
};

// Elasticsearch
export const createElasticClient = (node: string = process.env.ELASTIC_NODE || 'http://localhost:9200') => {
    return new Client({ node });
};

// Kafka
export const createKafkaClient = (clientId: string, brokers: string[] = [(process.env.KAFKA_BROKER || 'localhost:9092')]) => {
    return new Kafka({ clientId, brokers });
};
