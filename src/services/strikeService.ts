import axios from 'axios';
import logger from '../utils/logger';

const STRIKE_API_URL = process.env.STRIKE_API_URL || 'https://api.strike.me/v1';
const STRIKE_API_KEY = process.env.STRIKE_API_KEY;

export const strikeService = {
  async createInvoice(amount: number, currency: string, description: string): Promise<any> {
    try {
      const response = await axios.post(`${STRIKE_API_URL}/invoices`, {
        amount: {
          currency,
          amount: amount.toString()
        },
        description
      }, {
        headers: {
          'Authorization': `Bearer ${STRIKE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Strike invoice created', { invoiceId: response.data.invoiceId });
      return response.data;
    } catch (error) {
      logger.error('Error creating Strike invoice', { error });
      throw error;
    }
  },

  async getInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await axios.get(`${STRIKE_API_URL}/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${STRIKE_API_KEY}`
        }
      });

      logger.info('Strike invoice retrieved', { invoiceId, status: response.data.state });
      return response.data;
    } catch (error) {
      logger.error('Error retrieving Strike invoice', { error, invoiceId });
      throw error;
    }
  },

  async createQuote(invoiceId: string): Promise<any> {
    try {
      const response = await axios.post(`${STRIKE_API_URL}/invoices/${invoiceId}/quote`, {}, {
        headers: {
          'Authorization': `Bearer ${STRIKE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Strike quote created', { invoiceId, quoteId: response.data.quoteId });
      return response.data;
    } catch (error) {
      logger.error('Error creating Strike quote', { error, invoiceId });
      throw error;
    }
  },

  async executeWithdrawal(amount: number, currency: string, receiverHandle: string): Promise<any> {
    try {
      const response = await axios.post(`${STRIKE_API_URL}/withdrawals`, {
        amount: {
          currency,
          amount: amount.toString()
        },
        receiverHandle
      }, {
        headers: {
          'Authorization': `Bearer ${STRIKE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      logger.info('Strike withdrawal executed', { withdrawalId: response.data.withdrawalId });
      return response.data;
    } catch (error) {
      logger.error('Error executing Strike withdrawal', { error });
      throw error;
    }
  }
};