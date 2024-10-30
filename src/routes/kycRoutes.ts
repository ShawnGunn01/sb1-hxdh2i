import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { initiateKYC, getKYCStatus, handleVeriffCallback } from '../controllers/kycController';

const router = express.Router();

router.post('/initiate', authMiddleware, initiateKYC);
router.get('/status/:sessionId', authMiddleware, getKYCStatus);
router.post('/callback', handleVeriffCallback);

export default router;