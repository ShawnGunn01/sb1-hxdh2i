import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const securityHeadersMonitoring = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const missingHeaders = [
      'Strict-Transport-Security',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy',
      'X-XSS-Protection',
      'Referrer-Policy',
    ].filter(header => !res.getHeader(header));

    if (missingHeaders.length > 0) {
      logger.warn('Missing security headers', { 
        path: req.path, 
        missingHeaders 
      });
    }
  });

  next();
};

export default securityHeadersMonitoring;