import Stripe from 'stripe';
import logger from '../../utils/logger';

export class StripeLightningService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-08-16'
    });
  }

  async createLightningInvoice(amount: number, description: string): Promise<any> {
    try {
      // Create a PaymentIntent first
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        payment_method_types: ['lightning'],
        description
      });

      logger.info('Stripe Lightning invoice created', {
        amount,
        paymentIntentId: paymentIntent.id
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: amount,
        status: paymentIntent.status
      };
    } catch (error) {
      logger.error('Error creating Stripe Lightning invoice', { error, amount });
      throw new Error('Failed to create Lightning invoice');
    }
  }

  async confirmLightningPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: 'lightning'
      });

      const success = paymentIntent.status === 'succeeded';

      logger.info('Stripe Lightning payment confirmed', {
        paymentIntentId,
        status: paymentIntent.status,
        success
      });

      return success;
    } catch (error) {
      logger.error('Error confirming Lightning payment', { error, paymentIntentId });
      throw new Error('Failed to confirm Lightning payment');
    }
  }

  async getLightningPaymentStatus(paymentIntentId: string): Promise<string> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      logger.info('Stripe Lightning payment status retrieved', {
        paymentIntentId,
        status: paymentIntent.status
      });

      return paymentIntent.status;
    } catch (error) {
      logger.error('Error getting Lightning payment status', { error, paymentIntentId });
      throw new Error('Failed to get Lightning payment status');
    }
  }

  async waitForPaymentConfirmation(paymentIntentId: string, timeoutSeconds: number = 600): Promise<boolean> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getLightningPaymentStatus(paymentIntentId);
      
      if (status === 'succeeded') {
        return true;
      }
      
      if (status === 'canceled' || status === 'failed') {
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    }

    return false;
  }
}

export const stripeLightningService = new StripeLightningService();