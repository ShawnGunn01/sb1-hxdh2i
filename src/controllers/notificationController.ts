import { Request, Response } from 'express';
import { db } from '../config/database';
import { ObjectId } from 'mongodb';
import logger from '../utils/logger';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const notifications = await db.collection('notifications')
      .find({ userId: new ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const total = await db.collection('notifications').countDocuments({ userId: new ObjectId(req.userId) });

    res.json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total
    });
  } catch (error) {
    logger.error('Error fetching notifications', { error, userId: req.userId });
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const result = await db.collection('notifications').updateOne(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.userId) },
      { $set: { read: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Error marking notification as read', { error, userId: req.userId, notificationId: req.params.id });
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    await db.collection('notifications').updateMany(
      { userId: new ObjectId(req.userId), read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Error marking all notifications as read', { error, userId: req.userId });
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const result = await db.collection('notifications').deleteOne(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.userId) }
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error('Error deleting notification', { error, userId: req.userId, notificationId: req.params.id });
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

export const createNotification = async (userId: string, type: string, message: string, relatedId?: string) => {
  try {
    const notification = {
      userId: new ObjectId(userId),
      type,
      message,
      relatedId,
      read: false,
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);
  } catch (error) {
    logger.error('Error creating notification', { error, userId, type, message });
  }
};