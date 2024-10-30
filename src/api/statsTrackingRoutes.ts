import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateGlobalLeaderboard } from './leaderboardRoutes';

const router = express.Router();

interface WagerStats {
  userId: string;
  totalWagers: number;
  wins: number;
  losses: number;
  totalAmountWagered: number;
  netProfit: number;
}

interface WagerHistory {
  id: string;
  userId: string;
  opponentId: string;
  amount: number;
  gameId: string;
  outcome: 'win' | 'loss';
  date: Date;
}

// In-memory storage for user stats and wager history (replace with database in production)
let userStats: { [userId: string]: WagerStats } = {};
let wagerHistory: WagerHistory[] = [];

// Get user stats
router.get('/user/:userId/stats', (req, res) => {
  const { userId } = req.params;
  const stats = userStats[userId] || {
    userId,
    totalWagers: 0,
    wins: 0,
    losses: 0,
    totalAmountWagered: 0,
    netProfit: 0,
  };
  res.json(stats);
});

// Get user wager history
router.get('/user/:userId/history', (req, res) => {
  const { userId } = req.params;
  const history = wagerHistory.filter(wager => wager.userId === userId);
  res.json(history);
});

// Update user stats and wager history (called when a wager is completed)
router.post('/update-stats', (req, res) => {
  const { userId, opponentId, amount, gameId, outcome } = req.body;

  if (!userId || !opponentId || !amount || !gameId || !outcome) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Update user stats
  if (!userStats[userId]) {
    userStats[userId] = {
      userId,
      totalWagers: 0,
      wins: 0,
      losses: 0,
      totalAmountWagered: 0,
      netProfit: 0,
    };
  }

  userStats[userId].totalWagers += 1;
  userStats[userId].totalAmountWagered += amount;

  if (outcome === 'win') {
    userStats[userId].wins += 1;
    userStats[userId].netProfit += amount;
  } else {
    userStats[userId].losses += 1;
    userStats[userId].netProfit -= amount;
  }

  // Add to wager history
  const newWagerHistory: WagerHistory = {
    id: uuidv4(),
    userId,
    opponentId,
    amount,
    gameId,
    outcome,
    date: new Date(),
  };

  wagerHistory.push(newWagerHistory);

  // Update global leaderboard
  generateGlobalLeaderboard(userStats);

  res.status(201).json({ stats: userStats[userId], history: newWagerHistory });
});

export { userStats };
export default router;