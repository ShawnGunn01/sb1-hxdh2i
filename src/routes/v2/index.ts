import express from 'express';
import authRoutes from './authRoutes';
import gameRoutes from './gameRoutes';
import tournamentRoutes from './tournamentRoutes';
import paymentRoutes from './paymentRoutes';
import userRoutes from './userRoutes';
import analyticsRoutes from './analyticsRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/games', gameRoutes);
router.use('/tournaments', tournamentRoutes);
router.use('/payments', paymentRoutes);
router.use('/users', userRoutes);
router.use('/analytics', analyticsRoutes);

export default router;