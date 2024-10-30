import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, param, validationResult } from 'express-validator';
import { GameIntegrationService } from '../services/gameIntegrationService';

const router = express.Router();

// ... (previous code remains)

// Get game-specific leaderboard
router.get('/games/:id/leaderboard', [
  param('id').isMongoId().withMessage('Invalid game ID'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const leaderboard = await GameIntegrationService.getGameLeaderboard(req.params.id);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch game leaderboard', error: error.message });
  }
});

// Start a game session
router.post('/games/:id/start-session', [
  param('id').isMongoId().withMessage('Invalid game ID'),
  body('userId').notEmpty().withMessage('User ID is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const session = await GameIntegrationService.startGameSession(req.params.id, req.body.userId);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start game session', error: error.message });
  }
});

// End a game session
router.post('/games/:id/end-session', [
  param('id').isMongoId().withMessage('Invalid game ID'),
  body('sessionId').notEmpty().withMessage('Session ID is required'),
  body('score').isNumeric().withMessage('Score must be a number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const result = await GameIntegrationService.endGameSession(req.params.id, req.body.sessionId, req.body.score);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Failed to end game session', error: error.message });
  }
});

export default router;