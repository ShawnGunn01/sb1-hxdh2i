import express from 'express';
import { handleIncomingSMS } from '../controllers/smsController';

const router = express.Router();

router.post('/webhook', handleIncomingSMS);

export default router;