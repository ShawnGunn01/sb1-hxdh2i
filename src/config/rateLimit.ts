import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './database';
import logger from '../utils/logger';

// General API rate limit
export const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  handler: (req, res, next, options) => {
    logger.warn('Rate limit exceeded', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(options.statusCode).send(options.message);
  },
});

// Auth-specific rate limit (for login and registration)
export const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again later.',
  handler: (req, res, next, options) => {
    logger.warn('Auth rate limit exceeded', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(options.statusCode).send(options.message);
  },
});

// Game-specific rate limit
export const gameLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many game requests, please slow down.',
  handler: (req, res, next, options) => {
    logger.warn('Game rate limit exceeded', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(options.statusCode).send(options.message);
  },
});

// Wager-specific rate limit
export const wagerLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many wager requests, please slow down.',
  handler: (req, res, next, options) => {
    logger.warn('Wager rate limit exceeded', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(options.statusCode).send(options.message);
  },
});

// Payment-specific rate limit
export const paymentLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many payment requests, please try again later.',
  handler: (req, res, next, options) => {
    logger.warn('Payment rate limit exceeded', { 
      ip: req.ip, 
      path: req.path 
    });
    res.status(options.statusCode).send(options.message);
  },
});