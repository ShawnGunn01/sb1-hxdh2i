import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, param, validationResult } from 'express-validator';
import { moveToEscrow, releaseFromEscrow } from '../services/walletService';

const router = express.Router();

// All routes in this file are already protected by authMiddleware in index.ts

// ... (rest of the code remains the same)

export default router;