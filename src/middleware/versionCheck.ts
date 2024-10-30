import { Request, Response, NextFunction } from 'express';
import { API_VERSIONS, LATEST_VERSION, isVersionDeprecated, getVersionExpirationDate } from '../config/apiVersions';

export const versionCheck = (req: Request, res: Response, next: NextFunction) => {
  const version = req.path.split('/')[2]; // Assuming path is like /api/v1/...
  
  if (Object.values(API_VERSIONS).includes(version)) {
    res.setHeader('X-API-Version', version);
    res.setHeader('X-API-Deprecated', isVersionDeprecated(version).toString());
    
    const expirationDate = getVersionExpirationDate(version);
    if (expirationDate) {
      res.setHeader('X-API-Expiration-Date', expirationDate.toISOString());
    }

    if (version !== LATEST_VERSION) {
      res.setHeader('X-API-Latest-Version', LATEST_VERSION);
    }
  } else {
    // Handle unknown versions
    return res.status(400).json({ error: 'Invalid API version' });
  }
  next();
};