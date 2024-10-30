import { radarService } from '../radarService';
import logger from '../../utils/logger';

export class RiskAssessmentService {
  async evaluateUser(userId: string, verificationData: any): Promise<'low' | 'medium' | 'high'> {
    try {
      const riskFactors = await this.calculateRiskFactors(userId, verificationData);
      const riskScore = this.calculateRiskScore(riskFactors);
      
      logger.info('Risk assessment completed', { userId, riskScore, riskFactors });

      if (riskScore >= 0.7) return 'high';
      if (riskScore >= 0.4) return 'medium';
      return 'low';
    } catch (error) {
      logger.error('Error evaluating user risk', { error, userId });
      throw error;
    }
  }

  private async calculateRiskFactors(userId: string, verificationData: any): Promise<any> {
    const locationRisk = await this.assessLocationRisk(verificationData);
    const documentRisk = this.assessDocumentRisk(verificationData);
    const behavioralRisk = await this.assessBehavioralRisk(userId);

    return {
      locationRisk,
      documentRisk,
      behavioralRisk
    };
  }

  private async assessLocationRisk(verificationData: any): Promise<number> {
    try {
      const { latitude, longitude } = verificationData.location;
      const isHighRiskLocation = await radarService.isInGeofence(
        verificationData.userId,
        latitude,
        longitude,
        'high-risk-regions'
      );

      const ipLocation = await radarService.reverseGeocode(latitude, longitude);
      const locationMismatch = this.checkLocationMismatch(
        verificationData.document.issuingCountry,
        ipLocation.country.code
      );

      return (isHighRiskLocation ? 0.5 : 0) + (locationMismatch ? 0.3 : 0);
    } catch (error) {
      logger.error('Error assessing location risk', { error });
      return 0.5; // Default to medium risk on error
    }
  }

  private assessDocumentRisk(verificationData: any): number {
    let risk = 0;

    // Check document expiration
    const expiryDate = new Date(verificationData.document.expiryDate);
    const monthsUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30);
    if (monthsUntilExpiry < 3) risk += 0.3;

    // Check document quality
    if (verificationData.document.quality < 0.7) risk += 0.2;

    // Check for document tampering indicators
    if (verificationData.document.suspiciousElements > 0) risk += 0.5;

    return risk;
  }

  private async assessBehavioralRisk(userId: string): Promise<number> {
    // Implement behavioral analysis
    // This could include:
    // - Failed verification attempts
    // - Suspicious IP patterns
    // - Multiple devices
    // - Unusual timing patterns
    return 0; // Placeholder
  }

  private calculateRiskScore(factors: any): number {
    const weights = {
      locationRisk: 0.4,
      documentRisk: 0.4,
      behavioralRisk: 0.2
    };

    return (
      factors.locationRisk * weights.locationRisk +
      factors.documentRisk * weights.documentRisk +
      factors.behavioralRisk * weights.behavioralRisk
    );
  }

  private checkLocationMismatch(documentCountry: string, ipCountry: string): boolean {
    return documentCountry !== ipCountry;
  }
}