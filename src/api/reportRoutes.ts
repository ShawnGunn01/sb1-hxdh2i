import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { getReportData, downloadReport } from '../controllers/reportController';

const router = express.Router();

router.use(authMiddleware);
router.use(rbacMiddleware('view_reports'));

router.get('/', getReportData);
router.get('/download', downloadReport);

export default router;