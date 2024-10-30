import cron from 'node-cron';
import logger from './logger';
import { processSubscriptions } from '../services/subscriptionService';
import { cleanupOldData } from '../services/dataCleanupService';
import { updateAnalytics } from '../services/analyticsService';
import { processTournamentUpdates } from '../services/tournamentService';
import { performComplianceCheck } from '../scripts/scheduledComplianceCheck';

export const setupCronJobs = () => {
  // ... existing cron jobs

  // Schedule the compliance check to run weekly
  cron.schedule('0 0 * * 0', async () => {
    logger.info('Running weekly compliance check');
    try {
      await performComplianceCheck();
      logger.info('Weekly compliance check completed');
    } catch (error) {
      logger.error('Error in weekly compliance check', { error });
    }
  });

  logger.info('All cron jobs scheduled');
};