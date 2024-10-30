import twilio from 'twilio';
import logger from '../utils/logger';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const smsService = {
  async sendMessage(to: string, message: string): Promise<void> {
    try {
      await client.messages.create({
        body: message,
        to,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      logger.info('SMS sent successfully', { to });
    } catch (error) {
      logger.error('Error sending SMS', { error, to });
      throw error;
    }
  },

  async generateSecureLink(path: string, userId: string, expiresIn: number = 3600): Promise<string> {
    // Generate a secure, time-limited link for sensitive operations
    const token = jwt.sign({ userId, path }, process.env.JWT_SECRET, { expiresIn });
    return `${process.env.APP_URL}/secure/${token}`;
  },

  async sendVerificationLink(to: string, userId: string): Promise<void> {
    const link = await this.generateSecureLink('/kyc/verify', userId);
    const message = `Complete your PLLAY verification here: ${link}\nThis link expires in 1 hour.`;
    await this.sendMessage(to, message);
  },

  async sendPaymentLink(to: string, userId: string, type: 'deposit' | 'withdraw'): Promise<void> {
    const link = await this.generateSecureLink(`/payments/${type}`, userId);
    const message = `Complete your ${type} here: ${link}\nThis link expires in 1 hour.`;
    await this.sendMessage(to, message);
  }
};