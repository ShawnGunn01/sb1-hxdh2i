import Stripe from 'stripe';

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-11-15', // Use the latest API version
});

export const stripe = {
  async processPayment(amount: number, token: string, userId: string) {
    try {
      const charge = await stripeClient.charges.create({
        amount: Math.round(amount * 100), // Stripe expects amount in cents
        currency: 'usd',
        source: token,
        description: `Deposit for user ${userId}`,
      });

      return {
        success: true,
        transactionId: charge.id,
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw new Error('Stripe payment processing failed');
    }
  },
};