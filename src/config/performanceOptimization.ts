import { redisClient } from './database';
import { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import { RateLimiterRedis } from 'rate-limiter-flexible';

// Redis cache configuration
const CACHE_TTL = 3600; // 1 hour in seconds

export const cacheMiddleware = (duration: number) => {
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

// Compression middleware
export const compressionMiddleware = compression({
  level: 6, // Set compression level (0-9, 9 being best compression but slowest)
  threshold: 100 * 1024, // Only compress responses that are at least 100KB in size
});

// Rate limiting configuration
const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'middleware',
  points: 10, // 10 requests
  duration: 1, // per 1 second by IP
});

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  rateLimiter.consume(req.ip)
    .then(() => {
      next();
    })
    .catch(() => {
      res.status(429).send('Too Many Requests');
    });
};

// Database query optimization
export const optimizeQuery = (query: any) => {
  // Add index hints
  query.hint({ field1: 1, field2: 1 });

  // Limit fields returned
  query.select('field1 field2 field3');

  // Use lean queries for read-only operations
  query.lean();

  return query;
};

// Lazy loading for large datasets
export const lazyLoad = async (model: any, page: number, limit: number, conditions: any = {}) => {
  const skip = (page - 1) * limit;
  const totalDocs = await model.countDocuments(conditions);
  const totalPages = Math.ceil(totalDocs / limit);

  const data = await model.find(conditions)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data,
    currentPage: page,
    totalPages,
    totalDocs
  };
};

// Memory usage optimization
export const optimizeMemoryUsage = () => {
  if (global.gc) {
    global.gc();
  }
};

// Implement these optimizations in your application
export const applyPerformanceOptimizations = (app: any) => {
  app.use(compressionMiddleware);
  app.use(rateLimiterMiddleware);
  app.use(cacheMiddleware(CACHE_TTL));

  // Schedule periodic memory optimization
  setInterval(optimizeMemoryUsage, 30 * 60 * 1000); // Run every 30 minutes
};