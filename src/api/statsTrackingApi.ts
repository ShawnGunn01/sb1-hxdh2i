import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateGlobalLeaderboard } from './leaderboardApi';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

// All routes in this file are already protected by authMiddleware in index.ts

// ... (rest of the code remains the same)

export default router;