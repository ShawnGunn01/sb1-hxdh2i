import Queue from 'bull';
import { processSubscriptions } from '../services/subscriptionService';
import logger from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const subscriptionQueue = new Queue('subscription-processing', REDIS_URL);

subscriptionQueue.process(async (job) => {
  logger.info('Processing subscriptions', { jobId: job.id });
  try {
    const processedCount = await processSubscriptions();
    logger.info('Subscription processing completed', { jobId: job.id, processedCount });
    return { processedCount };
  } catch (error) {
    logger.error('Error processing subscriptions', { jobId: job.id, error });
    throw error;
  }
});

export const scheduleSubscriptionProcessing = () => {
  subscriptionQueue.add(
    {},
    {
      repeat: {
        cron: '0 0 * * *' // Run daily at midnight
      }
    }
  );
  logger.info('Subscription processing scheduled');
};

export default subscriptionQueue;