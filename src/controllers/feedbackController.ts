import { Request, Response } from 'express';
import { db } from '../config/database';
import logger from '../utils/logger';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { userId, rating, comment } = req.body;

    const feedback = {
      userId,
      rating,
      comment,
      createdAt: new Date()
    };

    await db.collection('feedback').insertOne(feedback);

    logger.info('Feedback submitted', { userId, rating });
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    logger.error('Error submitting feedback', { error });
    res.status(500).json({ message: 'Error submitting feedback' });
  }
};

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await db.collection('feedback').find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(feedback);
  } catch (error) {
    logger.error('Error fetching feedback', { error });
    res.status(500).json({ message: 'Error fetching feedback' });
  }
};