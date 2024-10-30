import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import {
  getTournaments,
  createTournament,
  getTournamentById,
  updateTournament,
  deleteTournament,
  joinTournament,
  leaveTournament,
  getTournamentLeaderboard
} from '../controllers/tournamentController';

const router = express.Router();

router.use(authMiddleware);

// Public routes
router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.get('/:id/leaderboard', getTournamentLeaderboard);

// Protected routes
router.post('/', rbacMiddleware('manage_tournaments'), createTournament);
router.put('/:id', rbacMiddleware('manage_tournaments'), updateTournament);
router.delete('/:id', rbacMiddleware('manage_tournaments'), deleteTournament);

// Player actions
router.post('/:id/join', rbacMiddleware('participate_tournaments'), joinTournament);
router.post('/:id/leave', rbacMiddleware('participate_tournaments'), leaveTournament);

export default router;