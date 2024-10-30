import axios from 'axios';
import { LocationContext, LocationCoordinates } from './types';
import logger from '../../utils/logger';

export class RadarService {
  private readonly apiKey: string;
  private readonly apiUrl: string;

  constructor() {
    this.apiKey = process.env.RADAR_API_KEY || '';
    this.apiUrl = 'https://api.radar.io/v1';
  }

  async getLocationContext(coordinates: LocationCoordinates): Promise<LocationContext> {
    try {
      const response = await axios.get(`${this.apiUrl}/context`, {
        params: {
          coordinates: `${coordinates.latitude},${coordinates.longitude}`
        },
        headers: this.getHeaders()
      });

      return response.data.context;
    } catch (error) {
      logger.error('Error getting location context', { error, coordinates });
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<LocationCoordinates | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/geocode/forward`, {
        params: { query: address },
        headers: this.getHeaders()
      });

      const location = response.data.addresses[0];
      return location ? {
        latitude: location.latitude,
        longitude: location.longitude
      } : null;
    } catch (error) {
      logger.error('Error geocoding address', { error, address });
      return null;
    }
  }

  async trackUserMovement(userId: string, coordinates: LocationCoordinates): Promise<void> {
    try {
      await axios.post(`${this.apiUrl}/track`, {
        userId,
        ...coordinates,
        accuracy: 50,
        deviceType: 'mobile'
      }, {
        headers: this.getHeaders()
      });

      logger.info('User movement tracked', { userId, coordinates });
    } catch (error) {
      logger.error('Error tracking user movement', { error, userId, coordinates });
      throw error;
    }
  }

  private getHeaders() {
    return {
      'Authorization': this.apiKey,
      'Content-Type': 'application/json'
    };
  }
}

export const radarService = new RadarService();