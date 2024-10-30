import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import cacheMiddleware from '../middleware/cacheMiddleware';
import {
  getGames,
  createGame,
  getGameById,
  updateGame,
  deleteGame,
  startGameSession,
  endGameSession,
  getGameLeaderboard
} from '../controllers/gameController';

const router = express.Router();

router.use(authMiddleware);

// Public routes
router.get('/', cacheMiddleware(300), getGames); // Cache for 5 minutes
router.get('/:id', cacheMiddleware(300), getGameById);
router.get('/:id/leaderboard', cacheMiddleware(60), getGameLeaderboard); // Cache for 1 minute

// Protected routes
router.post('/', rbacMiddleware('manage_games'), createGame);
router.put('/:id', rbacMiddleware('manage_games'), updateGame);
router.delete('/:id', rbacMiddleware('manage_games'), deleteGame);

// Player actions
router.post('/:id/start-session', rbacMiddleware('play_games'), startGameSession);
router.post('/:id/end-session', rbacMiddleware('play_games'), endGameSession);

export default router;