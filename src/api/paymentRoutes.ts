import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import {
  getWalletBalance,
  deposit,
  withdraw,
  getTransactions,
  convertToTokens,
  convertToCurrency
} from '../controllers/paymentController';

const router = express.Router();

router.use(authMiddleware);

// Public routes (still require authentication)
router.get('/wallet', getWalletBalance);
router.get('/transactions', getTransactions);

// Protected routes
router.post('/deposit', rbacMiddleware('manage_payments'), deposit);
router.post('/withdraw', rbacMiddleware('manage_payments'), withdraw);
router.post('/convert-to-tokens', rbacMiddleware('manage_payments'), convertToTokens);
router.post('/convert-to-currency', rbacMiddleware('manage_payments'), convertToCurrency);

export default router;