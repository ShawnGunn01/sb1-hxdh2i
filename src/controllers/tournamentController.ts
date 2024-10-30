import { Request, Response } from 'express';
import { db, cachedQuery } from '../config/database';
import { ObjectId } from 'mongodb';
import logger from '../utils/logger';

// ... (existing imports)

export const getTournaments = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate as string) };
      query.endDate = { $lte: new Date(endDate as string) };
    }

    const cacheKey = `tournaments:${JSON.stringify(query)}:${page}:${limit}`;
    const result = await cachedQuery(cacheKey, async () => {
      const tournaments = await db.collection('tournaments')
        .find(query)
        .skip(skip)
        .limit(Number(limit))
        .toArray();

      const total = await db.collection('tournaments').countDocuments(query);

      return {
        tournaments,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page)
      };
    }, 300); // Cache for 5 minutes

    res.json(result);
  } catch (error) {
    logger.error('Error fetching tournaments', { error });
    res.status(500).json({ message: 'Error fetching tournaments' });
  }
};

// ... (rest of the file remains the same)