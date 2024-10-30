import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import { getUsers, updateUser, deleteUser } from '../controllers/userController';
import { getGames, updateGame, deleteGame } from '../controllers/gameController';
import { getWagers } from '../controllers/wagerController';
import { getPlatformSettings, updatePlatformSettings } from '../controllers/platformSettingsController';

const router = express.Router();

router.use(authMiddleware);

// User management routes
router.get('/users', rbacMiddleware('manage_users'), getUsers);
router.put('/users/:id', rbacMiddleware('manage_users'), updateUser);
router.delete('/users/:id', rbacMiddleware('manage_users'), deleteUser);

// Game management routes
router.get('/games', rbacMiddleware('manage_games'), getGames);
router.put('/games/:id', rbacMiddleware('manage_games'), updateGame);
router.delete('/games/:id', rbacMiddleware('manage_games'), deleteGame);

// Wager management routes
router.get('/wagers', rbacMiddleware('manage_tournaments'), getWagers);

// Platform settings routes
router.get('/settings', rbacMiddleware('manage_platform_settings'), getPlatformSettings);
router.put('/settings', rbacMiddleware('manage_platform_settings'), updatePlatformSettings);

export default router;