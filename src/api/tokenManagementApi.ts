import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, validationResult } from 'express-validator';
import { setTokenValue, getTokenValue } from '../services/tokenService';

const router = express.Router();

// Get current token value
router.get('/value', authMiddleware, async (req, res) => {
  try {
    const tokenValue = await getTokenValue();
    res.json({ tokenValue });
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching token value' });
  }
});

// Set new token value
router.post('/value', authMiddleware, [
  body('value').isFloat({ min: 0.01 }).withMessage('Token value must be a positive number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { value } = req.body;

  try {
    await setTokenValue(value);
    res.json({ message: 'Token value updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating token value' });
  }
});

export default router;