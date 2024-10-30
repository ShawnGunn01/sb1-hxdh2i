import express from 'express';
import { WagerStats } from './statsTrackingRoutes';

const router = express.Router();

// In-memory storage for leaderboards (replace with database queries in production)
let globalLeaderboard: WagerStats[] = [];

// Generate global leaderboard
export const generateGlobalLeaderboard = (userStats: { [userId: string]: WagerStats }) => {
  globalLeaderboard = Object.values(userStats).sort((a, b) => {
    // Sort by win/loss ratio, then by total amount wagered
    const aRatio = a.wins / (a.wins + a.losses) || 0;
    const bRatio = b.wins / (b.wins + b.losses) || 0;
    if (bRatio !== aRatio) {
      return bRatio - aRatio;
    }
    return b.totalAmountWagered - a.totalAmountWagered;
  });
};

// Get global leaderboard
router.get('/global', (req, res) => {
  const { limit = '10', offset = '0' } = req.query;
  const parsedLimit = parseInt(limit as string, 10);
  const parsedOffset = parseInt(offset as string, 10);

  const paginatedLeaderboard = globalLeaderboard.slice(parsedOffset, parsedOffset + parsedLimit);
  
  res.json({
    leaderboard: paginatedLeaderboard,
    total: globalLeaderboard.length,
    limit: parsedLimit,
    offset: parsedOffset
  });
});

// Get game-specific leaderboard (mock implementation)
router.get('/game/:gameId', (req, res) => {
  const { gameId } = req.params;
  const { limit = '10', offset = '0' } = req.query;
  const parsedLimit = parseInt(limit as string, 10);
  const parsedOffset = parseInt(offset as string, 10);

  // Mock game-specific leaderboard (replace with actual game-specific data in production)
  const gameLeaderboard = globalLeaderboard
    .map(user => ({ ...user, gameSpecificScore: Math.floor(Math.random() * 1000) }))
    .sort((a, b) => b.gameSpecificScore - a.gameSpecificScore);

  const paginatedLeaderboard = gameLeaderboard.slice(parsedOffset, parsedOffset + parsedLimit);

  res.json({
    gameId,
    leaderboard: paginatedLeaderboard,
    total: gameLeaderboard.length,
    limit: parsedLimit,
    offset: parsedOffset
  });
});

export default router;