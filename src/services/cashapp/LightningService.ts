import axios from 'axios';
import logger from '../../utils/logger';

interface LightningInvoice {
  amount: {
    currency: string;
    value: string;
  };
  memo: string;
  network: 'LIGHTNING';
}

interface LightningInvoiceResponse {
  id: string;
  lnInvoice: string;
  qrCode: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  expiresAt: string;
}

export class CashAppLightningService {
  private readonly apiUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.apiUrl = process.env.CASHAPP_API_URL || 'https://api.cash.app/v1';
    this.apiKey = process.env.CASHAPP_API_KEY || '';
  }

  async createInvoice(amount: number, description: string): Promise<LightningInvoiceResponse> {
    try {
      const invoice: LightningInvoice = {
        amount: {
          currency: 'USD',
          value: amount.toFixed(2)
        },
        memo: description,
        network: 'LIGHTNING'
      };

      const response = await axios.post(`${this.apiUrl}/invoices`, invoice, {
        headers: this.getHeaders()
      });

      logger.info('Lightning invoice created', {
        amount,
        invoiceId: response.data.id
      });

      return response.data;
    } catch (error) {
      logger.error('Error creating Lightning invoice', { error, amount });
      throw new Error('Failed to create Lightning invoice');
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/invoices/${invoiceId}`, {
        headers: this.getHeaders()
      });

      logger.info('Lightning invoice status retrieved', {
        invoiceId,
        status: response.data.status
      });

      return response.data.status;
    } catch (error) {
      logger.error('Error getting Lightning invoice status', { error, invoiceId });
      throw new Error('Failed to get invoice status');
    }
  }

  async waitForPayment(invoiceId: string, timeoutSeconds: number = 600): Promise<boolean> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    while (Date.now() - startTime < timeoutMs) {
      const status = await this.getInvoiceStatus(invoiceId);
      
      if (status === 'PAID') {
        return true;
      }
      
      if (status === 'EXPIRED') {
        return false;
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
    }

    return false;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }
}

export const cashAppLightningService = new CashAppLightningService();