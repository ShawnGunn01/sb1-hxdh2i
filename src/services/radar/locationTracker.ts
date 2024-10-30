import { radarService } from '../radarService';
import { EventEmitter } from 'events';
import logger from '../../utils/logger';

export class LocationTracker extends EventEmitter {
  private activeUsers: Map<string, {
    latitude: number;
    longitude: number;
    lastUpdate: Date;
  }> = new Map();

  private geofenceViolations: Map<string, number> = new Map();

  async trackUserLocation(
    userId: string,
    latitude: number,
    longitude: number
  ): Promise<void> {
    try {
      const previousLocation = this.activeUsers.get(userId);
      this.activeUsers.set(userId, {
        latitude,
        longitude,
        lastUpdate: new Date()
      });

      // Check for suspicious movement
      if (previousLocation) {
        const distance = this.calculateDistance(
          previousLocation.latitude,
          previousLocation.longitude,
          latitude,
          longitude
        );

        const timeDiff = Date.now() - previousLocation.lastUpdate.getTime();
        const speed = distance / (timeDiff / 1000); // meters per second

        if (speed > 100) { // If movement speed is over 100 m/s (360 km/h)
          logger.warn('Suspicious user movement detected', {
            userId,
            speed,
            previousLocation,
            currentLocation: { latitude, longitude }
          });
          this.emit('suspicious_movement', { userId, speed, previousLocation });
        }
      }

      // Check geofence
      const isInAllowedArea = await radarService.isInGeofence(
        userId,
        latitude,
        longitude,
        'allowed-regions'
      );

      if (!isInAllowedArea) {
        const violations = (this.geofenceViolations.get(userId) || 0) + 1;
        this.geofenceViolations.set(userId, violations);

        logger.warn('Geofence violation detected', {
          userId,
          latitude,
          longitude,
          violations
        });

        this.emit('geofence_violation', {
          userId,
          latitude,
          longitude,
          violations
        });

        if (violations >= 3) {
          this.emit('account_suspended', { userId, reason: 'repeated_geofence_violations' });
        }
      } else {
        this.geofenceViolations.delete(userId);
      }

    } catch (error) {
      logger.error('Error tracking user location', { error, userId });
      throw error;
    }
  }

  async validateTransaction(
    userId: string,
    latitude: number,
    longitude: number,
    ipAddress: string
  ): Promise<boolean> {
    try {
      // Verify user is in allowed region
      const isInAllowedRegion = await radarService.isInGeofence(
        userId,
        latitude,
        longitude,
        'allowed-regions'
      );

      if (!isInAllowedRegion) {
        logger.warn('Transaction attempted from restricted region', {
          userId,
          latitude,
          longitude
        });
        return false;
      }

      // Check IP location matches GPS location
      const ipLocation = await radarService.reverseGeocode(latitude, longitude);
      const ipCountry = await this.getIpCountry(ipAddress);

      if (ipLocation.country.code !== ipCountry) {
        logger.warn('Location mismatch detected', {
          userId,
          gpsCountry: ipLocation.country.code,
          ipCountry
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating transaction location', { error, userId });
      throw error;
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async getIpCountry(ipAddress: string): Promise<string> {
    try {
      const response = await radarService.geocode(ipAddress);
      return response.country.code;
    } catch (error) {
      logger.error('Error getting IP country', { error, ipAddress });
      throw error;
    }
  }
}