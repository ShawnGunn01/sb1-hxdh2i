import axios from 'axios';
import logger from '../utils/logger';

interface LocationContext {
  country: {
    code: string;
    name: string;
  };
  state: {
    code: string;
    name: string;
  };
  geofences: Array<{
    tag: string;
    description: string;
  }>;
}

interface VerificationResult {
  allowed: boolean;
  message: string;
  context?: LocationContext;
}

export class RadarService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly restrictedCountries: Set<string>;
  private readonly restrictedStates: Set<string>;

  constructor() {
    this.apiKey = process.env.RADAR_API_KEY || '';
    this.apiUrl = 'https://api.radar.io/v1';
    this.restrictedCountries = new Set(['CN', 'IR', 'KP']);
    this.restrictedStates = new Set(['NY', 'NV', 'WA']); // Example restricted states
  }

  async verifyLocation(userId: string, latitude: number, longitude: number): Promise<VerificationResult> {
    try {
      const context = await this.getLocationContext(latitude, longitude);
      const isAllowed = this.checkLocationRestrictions(context);

      logger.info('Location verification completed', {
        userId,
        latitude,
        longitude,
        allowed: isAllowed,
        country: context.country.code,
        state: context.state.code
      });

      return {
        allowed: isAllowed,
        message: isAllowed 
          ? 'Location verified successfully'
          : 'Your location is not permitted for using PLLAY services due to regulatory restrictions.',
        context
      };
    } catch (error) {
      logger.error('Error verifying location', { error, userId, latitude, longitude });
      throw new Error('Unable to verify location. Please try again later.');
    }
  }

  async trackUserMovement(userId: string, latitude: number, longitude: number): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/track`, {
        userId,
        latitude,
        longitude,
        accuracy: 50, // meters
        deviceType: 'mobile'
      }, {
        headers: this.getHeaders()
      });

      logger.info('User movement tracked', { userId, latitude, longitude });
    } catch (error) {
      logger.error('Error tracking user movement', { error, userId, latitude, longitude });
      throw error;
    }
  }

  async createGeofence(
    description: string,
    tag: string,
    coordinates: Array<[number, number]>
  ): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/geofences`, {
        description,
        tag,
        type: 'polygon',
        coordinates
      }, {
        headers: this.getHeaders()
      });

      logger.info('Geofence created', { description, tag });
    } catch (error) {
      logger.error('Error creating geofence', { error, description, tag });
      throw error;
    }
  }

  async isInGeofence(userId: string, latitude: number, longitude: number, tag: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/geofences`, {
        params: {
          coordinates: `${latitude},${longitude}`,
          tag
        },
        headers: this.getHeaders()
      });

      const isInside = response.data.geofences.length > 0;
      logger.info('Geofence check completed', { userId, latitude, longitude, tag, isInside });
      return isInside;
    } catch (error) {
      logger.error('Error checking geofence', { error, userId, latitude, longitude, tag });
      throw error;
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/geocode/forward`, {
        params: { query: address },
        headers: this.getHeaders()
      });

      const location = response.data.addresses[0];
      if (!location) return false;

      const context = await this.getLocationContext(location.latitude, location.longitude);
      return this.checkLocationRestrictions(context);
    } catch (error) {
      logger.error('Error validating address', { error, address });
      throw error;
    }
  }

  private async getLocationContext(latitude: number, longitude: number): Promise<LocationContext> {
    try {
      const response = await axios.get(`${this.apiUrl}/context`, {
        params: { coordinates: `${latitude},${longitude}` },
        headers: this.getHeaders()
      });

      return response.data.context;
    } catch (error) {
      logger.error('Error getting location context', { error, latitude, longitude });
      throw error;
    }
  }

  private checkLocationRestrictions(context: LocationContext): boolean {
    // Check country restrictions
    if (this.restrictedCountries.has(context.country.code)) {
      return false;
    }

    // Check state restrictions (US only)
    if (context.country.code === 'US' && this.restrictedStates.has(context.state.code)) {
      return false;
    }

    // Check geofence restrictions
    const hasRestrictedGeofence = context.geofences.some(
      geofence => geofence.tag === 'restricted' || geofence.tag === 'high_risk'
    );

    return !hasRestrictedGeofence;
  }

  private getHeaders() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    };
  }
}

export const radarService = new RadarService();