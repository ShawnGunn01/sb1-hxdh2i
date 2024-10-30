import express from 'express';
import { WagerStats } from './statsTrackingApi';
import { authMiddleware } from '../middleware/authMiddleware';
import { getAsync, setAsync } from '../config/redis';
import { db } from '../config/database';

const router = express.Router();

const CACHE_EXPIRATION = 60 * 5; // 5 minutes

// Get global leaderboard
router.get('/global', authMiddleware, async (req, res) => {
  const { limit = '10', offset = '0' } = req.query;
  const parsedLimit = parseInt(limit as string, 10);
  const parsedOffset = parseInt(offset as string, 10);

  const cacheKey = `leaderboard:global:${parsedLimit}:${parsedOffset}`;
  
  try {
    // Try to get data from cache
    const cachedData = await getAsync(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    // If not in cache, fetch from database
    const leaderboard = await db.collection('users')
      .aggregate([
        { $sort: { 'stats.winLossRatio': -1, 'stats.totalAmountWagered': -1 } },
        { $skip: parsedOffset },
        { $limit: parsedLimit },
        { $project: { _id: 0, id: '$_id', name: 1, 'stats.winLossRatio': 1, 'stats.totalAmountWagered': 1 } }
      ])
      .toArray();

    const total = await db.collection('users').countDocuments();

    const result = {
      leaderboard,
      total,
      limit: parsedLimit,
      offset: parsedOffset
    };

    // Store in cache
    await setAsync(cacheKey, JSON.stringify(result), 'EX', CACHE_EXPIRATION);

    res.json(result);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ... (rest of the code remains the same)

export default router;