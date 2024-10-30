import axios from 'axios';
import { db } from '../config/database';

const COMPLIANCE_API = process.env.COMPLIANCE_API || 'https://api.complianceprovider.com/v1';
const COMPLIANCE_API_KEY = process.env.COMPLIANCE_API_KEY || 'your-compliance-api-key';

export class ComplianceService {
  static async checkUserEligibility(userId: string, gameId: string) {
    const user = await db.collection('users').findOne({ _id: userId });
    const game = await db.collection('games').findOne({ _id: gameId });

    if (!user || !game) {
      throw new Error('User or game not found');
    }

    try {
      const response = await axios.post(`${COMPLIANCE_API}/check-eligibility`, {
        userId: user._id,
        userAge: user.age,
        userLocation: user.location,
        gameType: game.type,
        wagerAmount: game.minimumWager
      }, {
        headers: {
          'Authorization': `Bearer ${COMPLIANCE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.eligible;
    } catch (error) {
      console.error('Error checking user eligibility:', error);
      throw new Error('Failed to check user eligibility');
    }
  }

  static async logWagerActivity(userId: string, gameId: string, amount: number) {
    try {
      await axios.post(`${COMPLIANCE_API}/log-activity`, {
        userId,
        gameId,
        amount,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${COMPLIANCE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Error logging wager activity:', error);
      // Consider how to handle this error (e.g., retry, store locally and sync later)
    }
  }

  static async getComplianceSettings() {
    try {
      const response = await axios.get(`${COMPLIANCE_API}/settings`, {
        headers: {
          'Authorization': `Bearer ${COMPLIANCE_API_KEY}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching compliance settings:', error);
      throw new Error('Failed to fetch compliance settings');
    }
  }

  static async updateComplianceSettings(settings: any) {
    try {
      const response = await axios.put(`${COMPLIANCE_API}/settings`, settings, {
        headers: {
          'Authorization': `Bearer ${COMPLIANCE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating compliance settings:', error);
      throw new Error('Failed to update compliance settings');
    }
  }
}