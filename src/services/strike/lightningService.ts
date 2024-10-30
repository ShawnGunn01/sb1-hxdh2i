import axios from 'axios';
import { WebSocket } from 'ws';
import QRCode from 'qrcode';
import logger from '../../utils/logger';

const STRIKE_API_URL = process.env.STRIKE_API_URL || 'https://api.strike.me/v1';
const STRIKE_API_KEY = process.env.STRIKE_API_KEY;

export class LightningService {
  private ws: WebSocket | null = null;
  private invoiceListeners: Map<string, (status: string) => void> = new Map();

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.ws = new WebSocket('wss://api.strike.me/websocket');
    
    this.ws.on('open', () => {
      logger.info('Strike WebSocket connection established');
      this.authenticate();
    });

    this.ws.on('message', (data: string) => {
      const message = JSON.parse(data);
      if (message.type === 'invoice_updated') {
        const callback = this.invoiceListeners.get(message.invoiceId);
        if (callback) {
          callback(message.status);
        }
      }
    });

    this.ws.on('error', (error) => {
      logger.error('Strike WebSocket error', { error });
    });

    this.ws.on('close', () => {
      logger.info('Strike WebSocket connection closed, attempting to reconnect...');
      setTimeout(() => this.initializeWebSocket(), 5000);
    });
  }

  private authenticate() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'authenticate',
        token: STRIKE_API_KEY
      }));
    }
  }

  async createLightningInvoice(amount: number, description: string): Promise<any> {
    try {
      const response = await axios.post(`${STRIKE_API_URL}/invoices`, {
        correlationId: `pllay-${Date.now()}`,
        amount: {
          amount: amount.toString(),
          currency: 'USD'
        },
        description
      }, {
        headers: {
          'Authorization': `Bearer ${STRIKE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const qrCode = await QRCode.toDataURL(response.data.lnInvoice);

      return {
        ...response.data,
        qrCode
      };
    } catch (error) {
      logger.error('Error creating Lightning invoice', { error });
      throw error;
    }
  }

  async waitForPayment(invoiceId: string): Promise<string> {
    return new Promise((resolve) => {
      this.invoiceListeners.set(invoiceId, (status: string) => {
        if (status === 'PAID') {
          this.invoiceListeners.delete(invoiceId);
          resolve(status);
        }
      });
    });
  }

  async getLightningNodeInfo(): Promise<any> {
    try {
      const response = await axios.get(`${STRIKE_API_URL}/network/node`, {
        headers: { 'Authorization': `Bearer ${STRIKE_API_KEY}` }
      });
      return response.data;
    } catch (error) {
      logger.error('Error getting Lightning node info', { error });
      throw error;
    }
  }

  async getInvoiceStatus(invoiceId: string): Promise<string> {
    try {
      const response = await axios.get(`${STRIKE_API_URL}/invoices/${invoiceId}`, {
        headers: { 'Authorization': `Bearer ${STRIKE_API_KEY}` }
      });
      return response.data.state;
    } catch (error) {
      logger.error('Error getting invoice status', { error, invoiceId });
      throw error;
    }
  }
}

export const lightningService = new LightningService();