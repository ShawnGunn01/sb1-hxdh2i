import axios from 'axios';
import logger from '../utils/logger';

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';

const getAccessToken = async () => {
  try {
    const response = await axios.post(`${PAYPAL_API_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
      auth: {
        username: process.env.PAYPAL_CLIENT_ID!,
        password: process.env.PAYPAL_CLIENT_SECRET!,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data.access_token;
  } catch (error) {
    logger.error('Error getting PayPal access token', { error });
    throw error;
  }
};

export const paypalService = {
  async createOrder(amount: number, currency: string = 'USD'): Promise<string> {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: currency,
                value: amount.toFixed(2),
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info('PayPal order created', { amount, currency, orderId: response.data.id });
      return response.data.id;
    } catch (error) {
      logger.error('Error creating PayPal order', { error, amount, currency });
      throw error;
    }
  },

  async capturePayment(orderId: string): Promise<any> {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.post(
        `${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info('PayPal payment captured', { orderId, status: response.data.status });
      return response.data;
    } catch (error) {
      logger.error('Error capturing PayPal payment', { error, orderId });
      throw error;
    }
  },

  async createPayout(email: string, amount: number, currency: string = 'USD'): Promise<any> {
    try {
      const accessToken = await getAccessToken();
      const response = await axios.post(
        `${PAYPAL_API_URL}/v1/payments/payouts`,
        {
          sender_batch_header: {
            sender_batch_id: `Payout_${Date.now()}`,
            email_subject: 'You have a payout!',
            email_message: 'You have received a payout! Thanks for using our service!',
          },
          items: [
            {
              recipient_type: 'EMAIL',
              amount: {
                value: amount.toFixed(2),
                currency,
              },
              receiver: email,
              note: 'Thanks for your patronage!',
              sender_item_id: `Item_${Date.now()}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      logger.info('PayPal payout created', { email, amount, currency, payoutBatchId: response.data.batch_header.payout_batch_id });
      return response.data;
    } catch (error) {
      logger.error('Error creating PayPal payout', { error, email, amount, currency });
      throw error;
    }
  },
};