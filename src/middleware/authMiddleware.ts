import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserService } from '../services/userService';
import { radarService } from '../services/radarService';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    logger.warn('Authentication attempt without token', { path: req.path });
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
    req.user = await UserService.getUserById(decoded.id);

    // Check user's location
    const { latitude, longitude } = req.body; // Assume these are sent with each request
    if (latitude && longitude) {
      const allowedCountry = 'US'; // Replace with your allowed country code
      const isInAllowedCountry = await radarService.isInCountry(req.userId, latitude, longitude, allowedCountry);
      if (!isInAllowedCountry) {
        logger.warn('User attempted access from restricted location', { userId: req.userId, latitude, longitude });
        return res.status(403).json({ message: 'Access denied from your current location' });
      }
    }

    logger.info('User authenticated', { userId: req.userId, path: req.path });
    next();
  } catch (err) {
    logger.error('Invalid token', { error: err, path: req.path });
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    logger.info('Admin access granted', { userId: req.userId, path: req.path });
    next();
  } else {
    logger.warn('Unauthorized admin access attempt', { userId: req.userId, path: req.path });
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};