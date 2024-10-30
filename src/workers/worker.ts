import { connectDB } from '../config/database';
import {
  subscriptionQueue,
  emailQueue,
  wagerSettlementQueue,
  analyticsUpdateQueue,
  tournamentUpdateQueue,
  scheduleJobs
} from '../queues';
import logger from '../utils/logger';

connectDB().then(() => {
  subscriptionQueue.process();
  emailQueue.process();
  wagerSettlementQueue.process();
  analyticsUpdateQueue.process();
  tournamentUpdateQueue.process();

  scheduleJobs();

  logger.info('Workers started and jobs scheduled');
}).catch((error) => {
  logger.error('Failed to connect to database', { error });
  process.exit(1);
});