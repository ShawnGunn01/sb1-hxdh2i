import Stripe from 'stripe';
import logger from '../utils/logger';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16', // Use the latest API version
});

export const stripeService = {
  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency,
      });
      logger.info('Stripe payment intent created', { amount, currency, paymentIntentId: paymentIntent.id });
      return paymentIntent;
    } catch (error) {
      logger.error('Error creating Stripe payment intent', { error, amount, currency });
      throw error;
    }
  },

  async processPayment(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId);
      logger.info('Stripe payment processed', { paymentIntentId, status: paymentIntent.status });
      return paymentIntent;
    } catch (error) {
      logger.error('Error processing Stripe payment', { error, paymentIntentId });
      throw error;
    }
  },

  async createRefund(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refund = await stripeClient.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });
      logger.info('Stripe refund created', { paymentIntentId, amount, refundId: refund.id });
      return refund;
    } catch (error) {
      logger.error('Error creating Stripe refund', { error, paymentIntentId, amount });
      throw error;
    }
  },

  async createPayout(amount: number, currency: string = 'usd'): Promise<Stripe.Payout> {
    try {
      const payout = await stripeClient.payouts.create({
        amount: Math.round(amount * 100),
        currency,
      });
      logger.info('Stripe payout created', { amount, currency, payoutId: payout.id });
      return payout;
    } catch (error) {
      logger.error('Error creating Stripe payout', { error, amount, currency });
      throw error;
    }
  },
};