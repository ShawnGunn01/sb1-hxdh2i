import { db } from '../../config/database';
import { redisClient } from '../../config/redis';
import { ObjectId } from 'mongodb';
import logger from '../../utils/logger';

interface WalletBalance {
  currency: number;
  tokens: number;
  escrowBalance: number;
}

interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'token_purchase' | 'token_sale' | 'escrow' | 'escrow_release';
  amount: number;
  currency: 'USD' | 'TOKEN';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  reference?: string;
  createdAt: Date;
}

export class WalletService {
  private readonly CACHE_TTL = 300; // 5 minutes

  async getBalance(userId: string): Promise<WalletBalance> {
    try {
      const cacheKey = `wallet:${userId}:balance`;
      const cachedBalance = await redisClient.get(cacheKey);

      if (cachedBalance) {
        return JSON.parse(cachedBalance);
      }

      const wallet = await db.collection('wallets').findOne({ userId: new ObjectId(userId) });
      const balance = wallet || { currency: 0, tokens: 0, escrowBalance: 0 };

      await redisClient.setEx(cacheKey, this.CACHE_TTL, JSON.stringify(balance));
      return balance;
    } catch (error) {
      logger.error('Error getting wallet balance', { error, userId });
      throw new Error('Failed to get wallet balance');
    }
  }

  async updateBalance(userId: string, amount: number, currency: 'USD' | 'TOKEN'): Promise<void> {
    const session = await db.client.startSession();
    session.startTransaction();

    try {
      const updateField = currency === 'USD' ? 'currency' : 'tokens';
      await db.collection('wallets').updateOne(
        { userId: new ObjectId(userId) },
        { $inc: { [updateField]: amount } },
        { upsert: true, session }
      );

      await session.commitTransaction();
      await this.invalidateCache(userId);

      logger.info('Wallet balance updated', { userId, amount, currency });
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error updating wallet balance', { error, userId, amount, currency });
      throw new Error('Failed to update wallet balance');
    } finally {
      session.endSession();
    }
  }

  async moveToEscrow(userId: string, amount: number): Promise<boolean> {
    const session = await db.client.startSession();
    session.startTransaction();

    try {
      const wallet = await db.collection('wallets').findOne(
        { userId: new ObjectId(userId) },
        { session }
      );

      if (!wallet || wallet.currency < amount) {
        await session.abortTransaction();
        return false;
      }

      await db.collection('wallets').updateOne(
        { userId: new ObjectId(userId) },
        {
          $inc: {
            currency: -amount,
            escrowBalance: amount
          }
        },
        { session }
      );

      await this.createTransaction({
        userId,
        type: 'escrow',
        amount,
        currency: 'USD',
        status: 'completed'
      }, session);

      await session.commitTransaction();
      await this.invalidateCache(userId);
      return true;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error moving funds to escrow', { error, userId, amount });
      throw new Error('Failed to move funds to escrow');
    } finally {
      session.endSession();
    }
  }

  async releaseFromEscrow(userId: string, amount: number, recipientId: string): Promise<boolean> {
    const session = await db.client.startSession();
    session.startTransaction();

    try {
      const wallet = await db.collection('wallets').findOne(
        { userId: new ObjectId(userId) },
        { session }
      );

      if (!wallet || wallet.escrowBalance < amount) {
        await session.abortTransaction();
        return false;
      }

      // Release from escrow
      await db.collection('wallets').updateOne(
        { userId: new ObjectId(userId) },
        { $inc: { escrowBalance: -amount } },
        { session }
      );

      // Add to recipient's balance
      await db.collection('wallets').updateOne(
        { userId: new ObjectId(recipientId) },
        { $inc: { currency: amount } },
        { upsert: true, session }
      );

      await this.createTransaction({
        userId,
        type: 'escrow_release',
        amount,
        currency: 'USD',
        status: 'completed',
        reference: recipientId
      }, session);

      await session.commitTransaction();
      await Promise.all([
        this.invalidateCache(userId),
        this.invalidateCache(recipientId)
      ]);
      return true;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error releasing funds from escrow', { error, userId, amount, recipientId });
      throw new Error('Failed to release funds from escrow');
    } finally {
      session.endSession();
    }
  }

  private async createTransaction(
    transaction: Omit<Transaction, 'id' | 'createdAt'>,
    session?: any
  ): Promise<void> {
    const newTransaction = {
      ...transaction,
      id: new ObjectId().toString(),
      createdAt: new Date()
    };

    await db.collection('transactions').insertOne(newTransaction, { session });
    logger.info('Transaction created', { transactionId: newTransaction.id, ...transaction });
  }

  private async invalidateCache(userId: string): Promise<void> {
    await redisClient.del(`wallet:${userId}:balance`);
  }
}

export const walletService = new WalletService();