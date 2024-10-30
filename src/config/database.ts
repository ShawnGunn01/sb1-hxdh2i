import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import logger from '../utils/logger';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pllay_db';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const client = new MongoClient(uri);
export const redisClient = createClient({ url: REDIS_URL });

export const connectDB = async () => {
  try {
    await client.connect();
    logger.info('Connected to MongoDB');

    await redisClient.connect();
    logger.info('Connected to Redis');

    const db = client.db();

    // Create indexes
    await createIndexes(db);

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Failed to connect to MongoDB or Redis', { error });
    process.exit(1);
  }
};

async function createIndexes(db: any) {
  try {
    // Existing indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('games').createIndex({ name: 1 });
    await db.collection('games').createIndex({ status: 1 });
    await db.collection('tournaments').createIndex({ startDate: 1, endDate: 1 });
    await db.collection('tournaments').createIndex({ status: 1 });
    await db.collection('wagers').createIndex({ userId: 1, status: 1 });
    await db.collection('wagers').createIndex({ gameId: 1 });
    await db.collection('wagers').createIndex({ createdAt: -1 });
    await db.collection('transactions').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('transactions').createIndex({ type: 1 });
    await db.collection('subscriptions').createIndex({ userId: 1 });
    await db.collection('subscriptions').createIndex({ nextBillingDate: 1 });

    // New indexes for improved performance
    await db.collection('users').createIndex({ lastLoginDate: -1 });
    await db.collection('games').createIndex({ popularity: -1 });
    await db.collection('tournaments').createIndex({ 'participants.userId': 1 });
    await db.collection('wagers').createIndex({ userId: 1, gameId: 1, status: 1 });
    await db.collection('transactions').createIndex({ userId: 1, type: 1, createdAt: -1 });

    logger.info('Database indexes created successfully');
  } catch (error) {
    logger.error('Error creating database indexes', { error });
    throw error;
  }
}

export const db = client.db();

// Query cache function
export async function cachedQuery(key: string, query: () => Promise<any>, expirationInSeconds: number = 3600) {
  const cachedResult = await redisClient.get(key);
  if (cachedResult) {
    return JSON.parse(cachedResult);
  }

  const result = await query();
  await redisClient.setEx(key, expirationInSeconds, JSON.stringify(result));
  return result;
}