import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/database';
import logger from '../utils/logger';

const MAX_REQUESTS_PER_HOUR = 1000;
const BLOCK_DURATION = 60 * 60; // 1 hour in seconds

const ipBlocker = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const key = `ip:${ip}:requests`;

  try {
    const requests = await redisClient.incr(key);

    if (requests === 1) {
      await redisClient.expire(key, 60 * 60); // Set expiry for 1 hour
    }

    if (requests > MAX_REQUESTS_PER_HOUR) {
      logger.warn(`Blocking suspicious IP: ${ip}`);
      await redisClient.setEx(`ip:${ip}:blocked`, BLOCK_DURATION, 'true');
      return res.status(403).json({ message: 'Too many requests, please try again later.' });
    }

    const isBlocked = await redisClient.get(`ip:${ip}:blocked`);
    if (isBlocked) {
      return res.status(403).json({ message: 'Your IP is temporarily blocked. Please try again later.' });
    }

    next();
  } catch (error) {
    logger.error('Error in IP blocker middleware', { error });
    next(error);
  }
};

export default ipBlocker;