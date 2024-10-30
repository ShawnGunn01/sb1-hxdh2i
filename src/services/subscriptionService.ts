import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

// ... (existing imports and functions)

export async function processSubscriptions(): Promise<number> {
  const now = new Date();
  logger.info('Starting subscription processing', { timestamp: now });

  const subscriptionsDue = await db.collection('subscriptions').find({ nextBillingDate: { $lte: now } }).toArray();
  logger.info(`Found ${subscriptionsDue.length} subscriptions due for processing`);

  let processedCount = 0;

  for (const subscription of subscriptionsDue) {
    try {
      await processSubscriptionPayment(subscription);
      await db.collection('subscriptions').updateOne(
        { id: subscription.id },
        { $set: { nextBillingDate: calculateNextBillingDate(now, subscription.frequency) } }
      );
      processedCount++;
      logger.info('Subscription processed successfully', { 
        subscriptionId: subscription.id, 
        userId: subscription.userId,
        amount: subscription.amount,
        frequency: subscription.frequency
      });
    } catch (error) {
      logger.error('Failed to process subscription', { 
        subscriptionId: subscription.id, 
        userId: subscription.userId, 
        error: error.message 
      });
    }
  }

  logger.info('Subscription processing completed', { 
    processedCount, 
    totalDue: subscriptionsDue.length 
  });

  return processedCount;
}

async function processSubscriptionPayment(subscription: any): Promise<void> {
  logger.info('Processing subscription payment', { 
    subscriptionId: subscription.id, 
    userId: subscription.userId 
  });

  await db.collection('wallets').updateOne(
    { userId: subscription.userId },
    { $inc: { tokenBalance: subscription.amount } }
  );

  logger.info('Subscription payment processed', { 
    subscriptionId: subscription.id, 
    userId: subscription.userId, 
    amount: subscription.amount 
  });

  // Add a transaction record
  await db.collection('transactions').insertOne({
    id: uuidv4(),
    userId: subscription.userId,
    type: 'subscription',
    amount: subscription.amount,
    status: 'completed',
    createdAt: new Date()
  });

  logger.info('Transaction record created for subscription payment', { 
    subscriptionId: subscription.id, 
    userId: subscription.userId 
  });
}