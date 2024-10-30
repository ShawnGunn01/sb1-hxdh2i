import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { tracer } from '../config/datadog';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
    };

    logger.info('Request completed', logData);

    // Send custom metric to Datadog
    tracer.increment('pllay.request_count', 1, [`status:${res.statusCode}`, `method:${req.method}`]);
    tracer.histogram('pllay.request_duration', duration, [`status:${res.statusCode}`, `method:${req.method}`]);
  });

  next();
};

export default requestLogger;