import { Request, Response } from 'express';
import { db, cachedQuery } from '../config/database';
import { ObjectId } from 'mongodb';
import logger from '../utils/logger';

// ... (existing imports)

export const getGames = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const cacheKey = `games:${JSON.stringify(query)}:${page}:${limit}`;
    const result = await cachedQuery(cacheKey, async () => {
      const games = await db.collection('games')
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .toArray();

      const total = await db.collection('games').countDocuments(query);

      return {
        games,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page)
      };
    }, 300); // Cache for 5 minutes

    res.json(result);
  } catch (error) {
    logger.error('Error fetching games', { error });
    res.status(500).json({ message: 'Error fetching games' });
  }
};

// ... (rest of the file remains the same)