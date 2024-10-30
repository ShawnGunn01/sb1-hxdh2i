import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { submitFeedback, getFeedback } from '../controllers/feedbackController';

const router = express.Router();

router.use(authMiddleware);

router.post('/', submitFeedback);
router.get('/', getFeedback);

export default router;