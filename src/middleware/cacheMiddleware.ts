import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../config/database';

const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedBody = await redisClient.get(key);

    if (cachedBody) {
      return res.send(JSON.parse(cachedBody));
    } else {
      res.sendResponse = res.send;
      res.send = (body: any) => {
        redisClient.set(key, JSON.stringify(body), 'EX', duration);
        res.sendResponse(body);
        return res;
      };
      next();
    }
  };
};

export default cacheMiddleware;