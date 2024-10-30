import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { radarService } from '../services/radarService';
import logger from '../utils/logger';

// ... existing imports and methods

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, latitude, longitude } = req.body;

    // Check if the user is in an allowed country
    const allowedCountry = 'US'; // Replace with your allowed country code
    const isInAllowedCountry = await radarService.isInCountry('newUser', latitude, longitude, allowedCountry);
    if (!isInAllowedCountry) {
      logger.warn('Registration attempt from restricted location', { email, latitude, longitude });
      return res.status(403).json({ message: 'Registration not allowed from your current location' });
    }

    const user = await UserService.createUser(name, email, password);
    const token = UserService.generateToken(user.id);

    logger.info('User registered successfully', { userId: user.id, email });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    logger.error('Registration error', { error, email: req.body.email });
    res.status(500).json({ message: 'Error in user registration' });
  }
};

// ... other methods