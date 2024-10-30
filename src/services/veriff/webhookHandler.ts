import { kycService } from '../kycService';
import { notificationService } from '../notificationService';
import { UserService } from '../userService';
import { RiskAssessmentService } from './riskAssessmentService';
import logger from '../../utils/logger';

export class VeriffWebhookHandler {
  private riskAssessment: RiskAssessmentService;

  constructor() {
    this.riskAssessment = new RiskAssessmentService();
  }

  async handleWebhook(payload: any): Promise<void> {
    try {
      const { verification, sessionId } = payload;
      const user = await UserService.findByVeriffSession(sessionId);

      if (!user) {
        logger.error('User not found for Veriff session', { sessionId });
        return;
      }

      switch (verification.status) {
        case 'approved':
          await this.handleApproved(user, verification);
          break;
        case 'declined':
          await this.handleDeclined(user, verification);
          break;
        case 'resubmission_requested':
          await this.handleResubmission(user, verification);
          break;
        case 'expired':
          await this.handleExpired(user, verification);
          break;
        default:
          logger.warn('Unknown verification status', { status: verification.status });
      }
    } catch (error) {
      logger.error('Error handling Veriff webhook', { error, payload });
      throw error;
    }
  }

  private async handleApproved(user: any, verification: any): Promise<void> {
    try {
      const riskLevel = await this.riskAssessment.evaluateUser(user.id, verification);

      if (riskLevel === 'high') {
        await this.requestAdditionalVerification(user.id);
      } else {
        await UserService.updateKycStatus(user.id, 'approved');
        await notificationService.sendKYCUpdate(user.id, 'approved', user.phoneNumber);
      }

      logger.info('Veriff verification approved', { 
        userId: user.id, 
        riskLevel,
        verificationDetails: verification 
      });
    } catch (error) {
      logger.error('Error handling approved verification', { error, userId: user.id });
      throw error;
    }
  }

  private async handleDeclined(user: any, verification: any): Promise<void> {
    try {
      await UserService.updateKycStatus(user.id, 'declined');
      await notificationService.sendKYCUpdate(user.id, 'declined', user.phoneNumber);
      
      logger.info('Veriff verification declined', {
        userId: user.id,
        reason: verification.reason,
        verificationDetails: verification
      });
    } catch (error) {
      logger.error('Error handling declined verification', { error, userId: user.id });
      throw error;
    }
  }

  private async handleResubmission(user: any, verification: any): Promise<void> {
    try {
      await UserService.updateKycStatus(user.id, 'resubmission_required');
      const newSession = await kycService.createSession(user.id);
      
      await notificationService.sendKYCUpdate(
        user.id,
        'resubmission',
        user.phoneNumber,
        newSession.verification.url
      );

      logger.info('Veriff resubmission requested', {
        userId: user.id,
        reason: verification.reason,
        newSessionId: newSession.id
      });
    } catch (error) {
      logger.error('Error handling resubmission request', { error, userId: user.id });
      throw error;
    }
  }

  private async handleExpired(user: any, verification: any): Promise<void> {
    try {
      await UserService.updateKycStatus(user.id, 'expired');
      const newSession = await kycService.createSession(user.id);
      
      await notificationService.sendKYCUpdate(
        user.id,
        'expired',
        user.phoneNumber,
        newSession.verification.url
      );

      logger.info('Veriff session expired', {
        userId: user.id,
        newSessionId: newSession.id
      });
    } catch (error) {
      logger.error('Error handling expired session', { error, userId: user.id });
      throw error;
    }
  }

  private async requestAdditionalVerification(userId: string): Promise<void> {
    try {
      await UserService.updateKycStatus(userId, 'additional_verification_required');
      const additionalSession = await kycService.createEnhancedSession(userId);
      
      logger.info('Additional verification requested for high-risk user', {
        userId,
        additionalSessionId: additionalSession.id
      });
    } catch (error) {
      logger.error('Error requesting additional verification', { error, userId });
      throw error;
    }
  }
}