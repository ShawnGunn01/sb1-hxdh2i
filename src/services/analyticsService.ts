import { db } from '../config/database';
import logger from '../utils/logger';

export const updateAnalytics = async () => {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

  try {
    const activeUsers = await db.collection('users').countDocuments({
      lastActivity: { $gte: hourAgo }
    });

    const hourlyRevenue = await db.collection('transactions').aggregate([
      {
        $match: {
          createdAt: { $gte: hourAgo },
          type: 'deposit'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]).toArray();

    const totalRevenue = hourlyRevenue.length > 0 ? hourlyRevenue[0].total : 0;

    await db.collection('hourlyAnalytics').insertOne({
      timestamp: now,
      activeUsers,
      revenue: totalRevenue
    });

    logger.info('Hourly analytics updated successfully');
  } catch (error) {
    logger.error('Error updating hourly analytics', { error });
    throw error;
  }
};