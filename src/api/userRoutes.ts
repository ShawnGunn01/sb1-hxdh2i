import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getUserProfile, updateUserProfile } from '../controllers/userController';

const router = express.Router();

router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

export default router;