import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { getAdvancedAnalytics, downloadAdvancedAnalyticsReport } from '../controllers/analyticsController';

const router = express.Router();

router.use(authMiddleware);
router.use(adminMiddleware);

// Existing routes
// ...

// New advanced analytics routes
router.get('/advanced-analytics', getAdvancedAnalytics);
router.get('/advanced-analytics/download', downloadAdvancedAnalyticsReport);

export default router;