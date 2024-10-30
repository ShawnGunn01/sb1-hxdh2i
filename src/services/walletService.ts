import { db } from '../config/database';
import { getAsync, setAsync, delAsync } from '../config/redis';

const CACHE_EXPIRATION = 60 * 15; // 15 minutes

export async function getWalletBalance(userId: string) {
  const cacheKey = `wallet:${userId}`;

  try {
    // Try to get data from cache
    const cachedData = await getAsync(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If not in cache, fetch from database
    const wallet = await db.collection('wallets').findOne({ userId });

    if (wallet) {
      // Store in cache
      await setAsync(cacheKey, JSON.stringify(wallet), 'EX', CACHE_EXPIRATION);
    }

    return wallet;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    throw error;
  }
}

export async function updateWalletBalance(userId: string, amount: number) {
  const session = await db.client.startSession();
  session.startTransaction();

  try {
    const result = await db.collection('wallets').findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { session, returnOriginal: false, upsert: true }
    );

    await session.commitTransaction();

    // Invalidate cache
    await delAsync(`wallet:${userId}`);

    return result.value;
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating wallet balance:', error);
    throw error;
  } finally {
    session.endSession();
  }
}

// ... (rest of the functions remain similar, just add cache invalidation where necessary)