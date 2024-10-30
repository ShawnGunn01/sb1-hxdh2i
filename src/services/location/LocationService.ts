import { radarService } from './RadarService';
import { locationRestrictions } from './LocationRestrictions';
import { LocationContext, VerificationResult, LocationCoordinates } from './types';
import logger from '../../utils/logger';

export class LocationService {
  constructor(
    private readonly radar = radarService,
    private readonly restrictions = locationRestrictions
  ) {}

  async verifyUserLocation(
    userId: string,
    coordinates: LocationCoordinates,
    gameType?: string
  ): Promise<VerificationResult> {
    try {
      const context = await this.radar.getLocationContext(coordinates);
      const regionRestrictions = this.restrictions.getRegionRestrictions(
        context.country.code,
        context.state.code
      );

      const isCashEnabled = this.restrictions.isCashEnabled(
        context.country.code,
        context.state.code,
        gameType
      );

      const isAllowed = isCashEnabled || this.restrictions.isVirtualCurrencyAllowed();

      logger.info('Location verification completed', {
        userId,
        coordinates,
        country: context.country.code,
        state: context.state.code,
        gameType,
        isCashEnabled,
        isAllowed
      });

      return {
        allowed: isAllowed,
        message: this.getVerificationMessage(isAllowed, isCashEnabled),
        context,
        restrictions: regionRestrictions
      };
    } catch (error) {
      logger.error('Error verifying user location', { error, userId, coordinates });
      throw new Error('Unable to verify location. Please try again later.');
    }
  }

  async validateAddress(address: string, gameType?: string): Promise<boolean> {
    try {
      const coordinates = await this.radar.geocodeAddress(address);
      if (!coordinates) return false;

      const result = await this.verifyUserLocation('address_validation', coordinates, gameType);
      return result.allowed;
    } catch (error) {
      logger.error('Error validating address', { error, address });
      return false;
    }
  }

  async trackUserLocation(userId: string, coordinates: LocationCoordinates): Promise<void> {
    try {
      await this.radar.trackUserMovement(userId, coordinates);
      logger.info('User location tracked', { userId, coordinates });
    } catch (error) {
      logger.error('Error tracking user location', { error, userId, coordinates });
      throw error;
    }
  }

  private getVerificationMessage(isAllowed: boolean, isCashEnabled: boolean): string {
    if (!isAllowed) {
      return 'Your location is not permitted for using PLLAY services due to regulatory restrictions.';
    }

    if (!isCashEnabled) {
      return 'Cash games are not available in your region. You can participate in virtual currency tournaments.';
    }

    return 'Location verified successfully. You can participate in all available games.';
  }
}

export const locationService = new LocationService();