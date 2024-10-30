import { veriffService } from './veriff/VeriffService';
import { locationService } from './location/LocationService';
import { LocationCoordinates } from './location/types';
import logger from '../utils/logger';

interface KYCData {
  userId: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  idNumber: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage: string;
  deviceLocation?: LocationCoordinates;
}

interface KYCVerificationResult {
  status: 'approved' | 'rejected' | 'pending';
  applicationId: string;
  message?: string;
  verificationUrl?: string;
}

export class KYCService {
  constructor(
    private readonly veriff = veriffService,
    private readonly location = locationService
  ) {}

  async submitKYC(userId: string, kycData: KYCData): Promise<KYCVerificationResult> {
    try {
      // Verify age requirement (18+)
      const birthDate = new Date(kycData.dateOfBirth);
      const age = this.calculateAge(birthDate);
      
      if (age < 18) {
        return {
          status: 'rejected',
          applicationId: '',
          message: 'Users must be at least 18 years old to participate.'
        };
      }

      // Verify device location is enabled and user is in an eligible location
      if (!kycData.deviceLocation) {
        return {
          status: 'rejected',
          applicationId: '',
          message: 'Device location settings must be enabled to verify eligibility.'
        };
      }

      // Verify user's location eligibility
      const locationVerification = await this.location.verifyUserLocation(
        userId,
        kycData.deviceLocation
      );

      if (!locationVerification.allowed) {
        return {
          status: 'rejected',
          applicationId: '',
          message: locationVerification.message
        };
      }

      // Create Veriff session
      const [firstName, ...lastNameParts] = kycData.fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      const veriffSession = await this.veriff.createSession({
        person: {
          firstName,
          lastName,
          dateOfBirth: kycData.dateOfBirth,
          idNumber: kycData.idNumber
        },
        document: {
          type: 'ID_CARD',
          country: locationVerification.context?.country.code || 'US'
        },
        vendorData: userId
      });
      
      // Store KYC data and verification status
      await this.storeKYCData(userId, {
        ...kycData,
        veriffSessionId: veriffSession.verification.id,
        status: 'pending',
        submissionDate: new Date()
      });

      logger.info('KYC submission successful', {
        userId,
        veriffSessionId: veriffSession.verification.id,
        age,
        location: kycData.deviceLocation
      });

      return {
        status: 'pending',
        applicationId: veriffSession.verification.id,
        message: 'KYC verification in progress. Please complete the verification process.',
        verificationUrl: veriffSession.verification.url
      };

    } catch (error) {
      logger.error('Error submitting KYC', { error, userId });
      throw new Error('Error submitting KYC verification');
    }
  }

  async getKYCStatus(userId: string): Promise<string> {
    try {
      const kycRecord = await this.getKYCRecord(userId);
      
      if (!kycRecord) {
        return 'not_submitted';
      }

      if (kycRecord.veriffSessionId) {
        const veriffStatus = await this.veriff.getSessionStatus(kycRecord.veriffSessionId);
        return this.mapVeriffStatus(veriffStatus);
      }

      return kycRecord.status;
    } catch (error) {
      logger.error('Error getting KYC status', { error, userId });
      throw new Error('Error getting KYC status');
    }
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private mapVeriffStatus(veriffStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'approved': 'approved',
      'resubmission_requested': 'resubmission_required',
      'declined': 'rejected',
      'expired': 'expired',
      'abandoned': 'abandoned'
    };

    return statusMap[veriffStatus] || 'pending';
  }

  private async storeKYCData(userId: string, data: any): Promise<void> {
    // Implementation for storing KYC data in your database
    // This would typically use your database service
    logger.info('Storing KYC data', { userId });
  }

  private async getKYCRecord(userId: string): Promise<any> {
    // Implementation for retrieving KYC record from your database
    // This would typically use your database service
    logger.info('Retrieving KYC record', { userId });
    return null;
  }
}

export const kycService = new KYCService();