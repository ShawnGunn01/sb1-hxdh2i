import express from 'express';
import { handleMessage, handleWebhook } from '../controllers/aiAgentController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/message', authMiddleware, handleMessage);
router.post('/webhook', handleWebhook);

export default router;