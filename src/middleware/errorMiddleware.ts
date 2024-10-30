import { Request, Response, NextFunction } from 'express';
import * as Sentry from "@sentry/node";
import logger from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      error: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
      request: {
        method: req.method,
        url: req.url,
        body: req.body,
        params: req.params,
        query: req.query,
        userId: req.userId,
      },
    });

    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Capture unexpected errors in Sentry
  Sentry.captureException(err);

  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      body: req.body,
      params: req.params,
      query: req.query,
      userId: req.userId,
    },
  });

  res.status(500).json({
    status: 'error',
    message: 'Something went wrong',
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  logger.warn('Not Found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.userId,
  });
  
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};