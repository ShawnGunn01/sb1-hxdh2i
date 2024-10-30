import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { UserService } from '../services/userService';
import { GameService } from '../services/gameService';
import { WagerService } from '../services/wagerService';
import { PlatformSettingsService } from '../services/platformSettingsService';

const router = express.Router();

// Middleware to ensure only admins can access these routes
router.use(authMiddleware, adminMiddleware);

// Users
router.get('/users', query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const users = await UserService.getUsers(page, limit);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.put('/users/:id', [
  body('name').optional().isString(),
  body('email').optional().isEmail(),
  body('role').optional().isIn(['user', 'admin']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedUser = await UserService.updateUser(req.params.id, req.body);
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await UserService.deleteUser(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

// Games
router.get('/games', query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const games = await GameService.getGames(page, limit);
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching games', error: error.message });
  }
});

router.put('/games/:id', [
  body('name').optional().isString(),
  body('description').optional().isString(),
  body('status').optional().isIn(['active', 'inactive']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedGame = await GameService.updateGame(req.params.id, req.body);
    res.json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: 'Error updating game', error: error.message });
  }
});

router.delete('/games/:id', async (req, res) => {
  try {
    await GameService.deleteGame(req.params.id);
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting game', error: error.message });
  }
});

// Wagers
router.get('/wagers', query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  try {
    const wagers = await WagerService.getWagers(page, limit);
    res.json(wagers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wagers', error: error.message });
  }
});

// Platform Settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await PlatformSettingsService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching platform settings', error: error.message });
  }
});

router.put('/settings', [
  body('tokenConversionRate').optional().isFloat({ min: 0 }),
  body('maxWagerAmount').optional().isFloat({ min: 0 }),
  body('minWagerAmount').optional().isFloat({ min: 0 }),
  body('platformFeePercentage').optional().isFloat({ min: 0, max: 100 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedSettings = await PlatformSettingsService.updateSettings(req.body);
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating platform settings', error: error.message });
  }
});

export default router;