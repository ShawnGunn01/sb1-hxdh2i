import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { io } from '../server';

const router = express.Router();

interface Wager {
  id: string;
  userId: string;
  opponentId: string;
  amount: number;
  gameId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: Date;
  winnerId?: string;
}

// In-memory storage for wagers (replace with database in production)
let wagers: Wager[] = [];

// Middleware to validate user balance (mock implementation)
const validateUserBalance = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // TODO: Implement actual balance check
  const userBalance = 1000; // Mock balance
  if (userBalance < req.body.amount) {
    return res.status(400).json({ error: 'Insufficient balance' });
  }
  next();
};

// Create a new wager
router.post('/wager', validateUserBalance, (req, res) => {
  const { userId, opponentId, amount, gameId } = req.body;

  if (!userId || !opponentId || !amount || !gameId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newWager: Wager = {
    id: uuidv4(),
    userId,
    opponentId,
    amount,
    gameId,
    status: 'pending',
    createdAt: new Date(),
  };

  wagers.push(newWager);

  // Notify opponent about the wager request
  io.to(opponentId).emit('newWagerRequest', newWager);

  res.status(201).json(newWager);
});

// Get wager by ID
router.get('/wager/:id', (req, res) => {
  const wager = wagers.find(w => w.id === req.params.id);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }
  res.json(wager);
});

// Accept a wager
router.post('/wager/:id/accept', validateUserBalance, (req, res) => {
  const wager = wagers.find(w => w.id === req.params.id);
  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'pending') {
    return res.status(400).json({ error: 'Wager cannot be accepted' });
  }

  wager.status = 'accepted';

  // Notify users about the accepted wager
  io.to(wager.userId).to(wager.opponentId).emit('wagerAccepted', wager);

  res.json(wager);
});

// Complete a wager
router.post('/wager/:id/complete', (req, res) => {
  const { winnerId } = req.body;
  const wager = wagers.find(w => w.id === req.params.id);

  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'accepted') {
    return res.status(400).json({ error: 'Wager cannot be completed' });
  }

  if (winnerId !== wager.userId && winnerId !== wager.opponentId) {
    return res.status(400).json({ error: 'Invalid winner' });
  }

  wager.status = 'completed';
  wager.winnerId = winnerId;

  // Notify users about the completed wager
  io.to(wager.userId).to(wager.opponentId).emit('wagerCompleted', wager);

  res.json(wager);
});

// Cancel a wager
router.post('/wager/:id/cancel', (req, res) => {
  const wager = wagers.find(w => w.id === req.params.id);

  if (!wager) {
    return res.status(404).json({ error: 'Wager not found' });
  }

  if (wager.status !== 'pending') {
    return res.status(400).json({ error: 'Only pending wagers can be cancelled' });
  }

  wager.status = 'cancelled';

  // Notify users about the cancelled wager
  io.to(wager.userId).to(wager.opponentId).emit('wagerCancelled', wager);

  res.json(wager);
});

// Get all wagers for a user
router.get('/user/:userId/wagers', (req, res) => {
  const userWagers = wagers.filter(w => w.userId === req.params.userId || w.opponentId === req.params.userId);
  res.json(userWagers);
});

export default router;