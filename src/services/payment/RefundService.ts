import { stripeLightningService } from '../stripe/LightningService';
import { cashAppLightningService } from '../cashapp/LightningService';
import { paypalService } from '../paypal/PaypalService';
import { strikeService } from '../strike/StrikeService';
import { walletService } from '../wallet/WalletService';
import { db } from '../../config/database';
import logger from '../../utils/logger';

interface RefundRequest {
  userId: string;
  transactionId: string;
  paymentMethod: 'stripe' | 'cashapp' | 'paypal' | 'strike';
  amount: number;
  reason?: string;
}

interface RefundResult {
  success: boolean;
  refundId?: string;
  message?: string;
  status: 'pending' | 'completed' | 'failed';
}

export class RefundService {
  constructor(
    private readonly stripe = stripeLightningService,
    private readonly cashApp = cashAppLightningService,
    private readonly paypal = paypalService,
    private readonly strike = strikeService,
    private readonly wallet = walletService
  ) {}

  async processRefund(request: RefundRequest): Promise<RefundResult> {
    const session = await db.client.startSession();
    session.startTransaction();

    try {
      // Verify the original transaction
      const transaction = await this.verifyTransaction(request.transactionId, request.userId);
      if (!transaction) {
        throw new Error('Transaction not found or not eligible for refund');
      }

      // Process refund based on payment method
      let refundResult: RefundResult;
      switch (request.paymentMethod) {
        case 'stripe':
          refundResult = await this.processStripeRefund(transaction, request.amount);
          break;
        case 'cashapp':
          refundResult = await this.processCashAppRefund(transaction, request.amount, request.reason);
          break;
        case 'paypal':
          refundResult = await this.processPayPalRefund(transaction, request.amount);
          break;
        case 'strike':
          refundResult = await this.processStrikeRefund(transaction, request.amount);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Update wallet balance
      if (refundResult.success) {
        await this.wallet.updateBalance(request.userId, -request.amount, 'USD');
        await this.createRefundRecord(request, refundResult, session);
      }

      await session.commitTransaction();
      logger.info('Refund processed successfully', {
        userId: request.userId,
        transactionId: request.transactionId,
        amount: request.amount,
        paymentMethod: request.paymentMethod
      });

      return refundResult;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Error processing refund', { error, request });
      throw error;
    } finally {
      session.endSession();
    }
  }

  private async verifyTransaction(transactionId: string, userId: string): Promise<any> {
    const transaction = await db.collection('transactions').findOne({
      _id: transactionId,
      userId,
      type: 'deposit',
      status: 'completed'
    });

    if (!transaction) {
      logger.warn('Invalid transaction for refund', { transactionId, userId });
      return null;
    }

    // Check if transaction is within refund window (e.g., 30 days)
    const refundWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (Date.now() - transaction.createdAt.getTime() > refundWindow) {
      logger.warn('Transaction outside refund window', { transactionId, userId });
      return null;
    }

    return transaction;
  }

  private async processStripeRefund(transaction: any, amount: number): Promise<RefundResult> {
    try {
      const refund = await this.stripe.createRefund(transaction.paymentIntentId, amount);
      return {
        success: true,
        refundId: refund.id,
        status: 'completed'
      };
    } catch (error) {
      logger.error('Stripe refund error', { error, transaction });
      throw new Error('Failed to process Stripe refund');
    }
  }

  private async processCashAppRefund(transaction: any, amount: number, reason?: string): Promise<RefundResult> {
    try {
      const refund = await this.cashApp.createRefund(transaction.paymentId, amount, reason);
      return {
        success: true,
        refundId: refund.id,
        status: 'completed'
      };
    } catch (error) {
      logger.error('Cash App refund error', { error, transaction });
      throw new Error('Failed to process Cash App refund');
    }
  }

  private async processPayPalRefund(transaction: any, amount: number): Promise<RefundResult> {
    try {
      const refund = await this.paypal.refundPayment(transaction.captureId, amount);
      return {
        success: true,
        refundId: refund.id,
        status: 'completed'
      };
    } catch (error) {
      logger.error('PayPal refund error', { error, transaction });
      throw new Error('Failed to process PayPal refund');
    }
  }

  private async processStrikeRefund(transaction: any, amount: number): Promise<RefundResult> {
    try {
      const refund = await this.strike.createRefund(transaction.invoiceId, amount);
      return {
        success: true,
        refundId: refund.id,
        status: refund.status === 'COMPLETED' ? 'completed' : 'pending'
      };
    } catch (error) {
      logger.error('Strike refund error', { error, transaction });
      throw new Error('Failed to process Strike refund');
    }
  }

  private async createRefundRecord(
    request: RefundRequest,
    result: RefundResult,
    session: any
  ): Promise<void> {
    await db.collection('refunds').insertOne({
      userId: request.userId,
      transactionId: request.transactionId,
      refundId: result.refundId,
      amount: request.amount,
      paymentMethod: request.paymentMethod,
      reason: request.reason,
      status: result.status,
      createdAt: new Date()
    }, { session });
  }
}

export const refundService = new RefundService();