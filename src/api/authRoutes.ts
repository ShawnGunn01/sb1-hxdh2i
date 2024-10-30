import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validate';
import { authMiddleware } from '../middleware/authMiddleware';
import { login, register, requestPasswordReset, resetPassword, setupTwoFactor, verifyTwoFactor, loginWithTwoFactor } from '../controllers/authController';

const router = express.Router();

// ... (existing routes)

router.post('/login', validate([
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('twoFactorToken').optional().isString().isLength({ min: 6, max: 6 }),
]), loginWithTwoFactor);

router.post('/two-factor/setup', authMiddleware, setupTwoFactor);

router.post('/two-factor/verify', authMiddleware, validate([
  body('token').isString().isLength({ min: 6, max: 6 }),
]), verifyTwoFactor);

export default router;