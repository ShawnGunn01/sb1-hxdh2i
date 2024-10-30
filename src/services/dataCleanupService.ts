import { db } from '../config/database';
import logger from '../utils/logger';

export const cleanupOldData = async () => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  try {
    // Delete old notifications
    await db.collection('notifications').deleteMany({
      createdAt: { $lt: oneMonthAgo },
      read: true
    });

    // Archive old transactions
    const oldTransactions = await db.collection('transactions').find({
      createdAt: { $lt: oneMonthAgo }
    }).toArray();

    if (oldTransactions.length > 0) {
      await db.collection('archivedTransactions').insertMany(oldTransactions);
      await db.collection('transactions').deleteMany({
        _id: { $in: oldTransactions.map(t => t._id) }
      });
    }

    // Add more cleanup tasks as needed

    logger.info('Data cleanup completed successfully');
  } catch (error) {
    logger.error('Error during data cleanup', { error });
    throw error;
  }
};