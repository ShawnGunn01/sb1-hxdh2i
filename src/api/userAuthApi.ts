import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/authMiddleware';
import { login, register, getProfile } from '../controllers/authController';
import { AppError } from '../middleware/errorMiddleware';
import logger from '../utils/logger';

const router = express.Router();

router.post('/register', validate([
  body('name').trim().isLength({ min: 2, max: 50 }).escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
    .withMessage('Password must be at least 8 characters long, contain a number, an uppercase letter, a lowercase letter, and a special character'),
]), async (req, res, next) => {
  try {
    await register(req, res);
  } catch (error) {
    logger.error('Registration error', { error, user: req.body.email });
    next(new AppError('Registration failed', 500));
  }
});

router.post('/login', validate([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]), async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    logger.error('Login error', { error, user: req.body.email });
    next(new AppError('Login failed', 500));
  }
});

router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    await getProfile(req, res);
  } catch (error) {
    logger.error('Get profile error', { error, userId: req.userId });
    next(new AppError('Failed to get profile', 500));
  }
});

export default router;