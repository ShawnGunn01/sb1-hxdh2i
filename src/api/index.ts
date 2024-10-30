import express from 'express';
import { body, validationResult } from 'express-validator';
import p2pWageringApi from './p2pWageringApi';
import statsTrackingApi from './statsTrackingApi';
import leaderboardApi from './leaderboardApi';
import userAuthApi from './userAuthApi';
import gameIntegrationApi from './gameIntegrationApi';
import paymentApi from './paymentApi';
import achievementsApi from './achievementsApi';
import dashboardApi from './dashboardApi';
import notificationsApi from './notificationsApi';
import tokenManagementApi from './tokenManagementApi';
import kycApi from './kycApi';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// ... (previous code remains)

// KYC routes
router.use('/kyc', authMiddleware, kycApi);

export default router;