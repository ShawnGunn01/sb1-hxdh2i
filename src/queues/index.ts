import Queue from 'bull';
import { processSubscriptions } from '../services/subscriptionService';
import { processEmailNotifications } from '../services/notificationService';
import { processWagerSettlement } from '../services/wagerService';
import { processAnalyticsUpdate } from '../services/analyticsService';
import { processTournamentUpdates } from '../services/tournamentService';
import logger from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const subscriptionQueue = new Queue('subscription-processing', REDIS_URL);
export const emailQueue = new Queue('email-notifications', REDIS_URL);
export const wagerSettlementQueue = new Queue('wager-settlement', REDIS_URL);
export const analyticsUpdateQueue = new Queue('analytics-update', REDIS_URL);
export const tournamentUpdateQueue = new Queue('tournament-update', REDIS_URL);

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

emailQueue.process(async (job) => {
  logger.info('Processing email notifications', { jobId: job.id });
  try {
    await processEmailNotifications(job.data);
    logger.info('Email notification sent', { jobId: job.id });
  } catch (error) {
    logger.error('Error sending email notification', { jobId: job.id, error });
    throw error;
  }
});

wagerSettlementQueue.process(async (job) => {
  logger.info('Processing wager settlement', { jobId: job.id });
  try {
    await processWagerSettlement(job.data);
    logger.info('Wager settlement completed', { jobId: job.id });
  } catch (error) {
    logger.error('Error processing wager settlement', { jobId: job.id, error });
    throw error;
  }
});

analyticsUpdateQueue.process(async (job) => {
  logger.info('Processing analytics update', { jobId: job.id });
  try {
    await processAnalyticsUpdate();
    logger.info('Analytics update completed', { jobId: job.id });
  } catch (error) {
    logger.error('Error processing analytics update', { jobId: job.id, error });
    throw error;
  }
});

tournamentUpdateQueue.process(async (job) => {
  logger.info('Processing tournament updates', { jobId: job.id });
  try {
    await processTournamentUpdates();
    logger.info('Tournament updates completed', { jobId: job.id });
  } catch (error) {
    logger.error('Error processing tournament updates', { jobId: job.id, error });
    throw error;
  }
});

export const scheduleJobs = () => {
  subscriptionQueue.add(
    {},
    {
      repeat: {
        cron: '0 0 * * *' // Run daily at midnight
      }
    }
  );
  logger.info('Subscription processing scheduled');

  analyticsUpdateQueue.add(
    {},
    {
      repeat: {
        cron: '0 * * * *' // Run hourly
      }
    }
  );
  logger.info('Analytics update scheduled');

  tournamentUpdateQueue.add(
    {},
    {
      repeat: {
        cron: '*/15 * * * *' // Run every 15 minutes
      }
    }
  );
  logger.info('Tournament updates scheduled');
};

export const queueEmailNotification = (to: string, subject: string, body: string) => {
  return emailQueue.add({ to, subject, body });
};

export const queueWagerSettlement = (wagerId: string) => {
  return wagerSettlementQueue.add({ wagerId });
};

export const queueAnalyticsUpdate = () => {
  return analyticsUpdateQueue.add({});
};

export const queueTournamentUpdate = () => {
  return tournamentUpdateQueue.add({});
};