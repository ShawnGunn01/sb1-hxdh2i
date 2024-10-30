import { Request, Response } from 'express';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';
import logger from '../utils/logger';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile', { error, userId: req.userId });
    res.status(500).json({ message: 'Error fetching user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { name, username } = req.body;

    // Check if username is already taken
    if (username) {
      const existingUser = await db.collection('users').findOne({ username, _id: { $ne: new ObjectId(req.userId) } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.userId) },
      { $set: { name, username, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    logger.error('Error updating user profile', { error, userId: req.userId });
    res.status(500).json({ message: 'Error updating user profile' });
  }
};