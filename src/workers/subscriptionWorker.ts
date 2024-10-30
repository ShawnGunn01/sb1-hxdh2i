import subscriptionQueue from '../queues/subscriptionQueue';
import { connectDB } from '../config/database';
import logger from '../utils/logger';

connectDB().then(() => {
  subscriptionQueue.process(async (job) => {
    try {
      logger.info('Starting subscription processing', { jobId: job.id });
      const processedCount = await job.data.processSubscriptions();
      logger.info('Subscription processing completed', { jobId: job.id, processedCount });
      return { processedCount };
    } catch (error) {
      logger.error('Error processing subscriptions', { jobId: job.id, error });
      throw error;
    }
  });

  logger.info('Subscription worker started');
}).catch((error) => {
  logger.error('Failed to connect to database', { error });
  process.exit(1);
});