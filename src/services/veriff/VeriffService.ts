import axios from 'axios';
import logger from '../../utils/logger';

interface VeriffSessionConfig {
  person: {
    firstName: string;
    lastName: string;
    idNumber?: string;
    dateOfBirth: string;
  };
  document: {
    type: 'PASSPORT' | 'ID_CARD' | 'DRIVER_LICENSE';
    country: string;
  };
  vendorData?: string;
  timestamp?: string;
}

interface VeriffSession {
  id: string;
  status: string;
  verification: {
    id: string;
    url: string;
    vendorData?: string;
    host: string;
    status: string;
    sessionToken: string;
  };
}

export class VeriffService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly callbackUrl: string;

  constructor() {
    this.apiKey = process.env.VERIFF_API_KEY || '';
    this.apiUrl = 'https://api.veriff.com/v1';
    this.callbackUrl = `${process.env.APP_URL}/api/kyc/callback`;
  }

  async createSession(config: VeriffSessionConfig): Promise<VeriffSession> {
    try {
      const response = await axios.post(`${this.apiUrl}/sessions`, {
        verification: {
          callback: this.callbackUrl,
          person: {
            firstName: config.person.firstName,
            lastName: config.person.lastName,
            idNumber: config.person.idNumber,
            dateOfBirth: config.person.dateOfBirth
          },
          document: {
            type: config.document.type,
            country: config.document.country
          },
          vendorData: config.vendorData,
          timestamp: config.timestamp || new Date().toISOString()
        }
      }, {
        headers: this.getHeaders()
      });

      logger.info('Veriff session created', {
        sessionId: response.data.verification.id,
        person: `${config.person.firstName} ${config.person.lastName}`,
        documentType: config.document.type,
        country: config.document.country
      });

      return response.data;
    } catch (error) {
      logger.error('Error creating Veriff session', { error, config });
      throw new Error('Failed to create verification session');
    }
  }

  async getSessionStatus(sessionId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/sessions/${sessionId}/decision`, {
        headers: this.getHeaders()
      });

      logger.info('Veriff session status retrieved', {
        sessionId,
        status: response.data.verification.status
      });

      return response.data.verification.status;
    } catch (error) {
      logger.error('Error getting Veriff session status', { error, sessionId });
      throw new Error('Failed to get verification status');
    }
  }

  async getVerificationDetails(sessionId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/sessions/${sessionId}`, {
        headers: this.getHeaders()
      });

      logger.info('Veriff verification details retrieved', { sessionId });
      return response.data;
    } catch (error) {
      logger.error('Error getting verification details', { error, sessionId });
      throw new Error('Failed to get verification details');
    }
  }

  validateCallback(signature: string, payload: string): boolean {
    try {
      // Implement Veriff webhook signature validation
      // This is a placeholder - implement actual signature validation
      return true;
    } catch (error) {
      logger.error('Error validating Veriff callback', { error });
      return false;
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }
}

export const veriffService = new VeriffService();