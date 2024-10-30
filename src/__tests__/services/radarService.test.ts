import { RadarService } from '../../services/radarService';
import axios from 'axios';
import logger from '../../utils/logger';

jest.mock('axios');
jest.mock('../../utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RadarService', () => {
  let radarService: RadarService;

  beforeEach(() => {
    radarService = new RadarService();
    jest.clearAllMocks();
  });

  describe('verifyLocation', () => {
    const mockContext = {
      country: { code: 'US', name: 'United States' },
      state: { code: 'CA', name: 'California' },
      geofences: []
    };

    test('allows valid location', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { context: mockContext } });

      const result = await radarService.verifyLocation('user123', 37.7749, -122.4194);

      expect(result.allowed).toBe(true);
      expect(result.message).toContain('verified successfully');
      expect(logger.info).toHaveBeenCalledWith('Location verification completed', expect.any(Object));
    });

    test('blocks restricted country', async () => {
      const restrictedContext = {
        ...mockContext,
        country: { code: 'CN', name: 'China' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: { context: restrictedContext } });

      const result = await radarService.verifyLocation('user123', 39.9042, 116.4074);

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('not permitted');
    });

    test('blocks restricted state', async () => {
      const restrictedContext = {
        ...mockContext,
        state: { code: 'NY', name: 'New York' }
      };
      mockedAxios.get.mockResolvedValueOnce({ data: { context: restrictedContext } });

      const result = await radarService.verifyLocation('user123', 40.7128, -74.0060);

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('not permitted');
    });
  });

  describe('isInGeofence', () => {
    test('returns true when inside geofence', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { geofences: [{ tag: 'test-fence' }] }
      });

      const result = await radarService.isInGeofence('user123', 37.7749, -122.4194, 'test-fence');

      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith('Geofence check completed', expect.any(Object));
    });

    test('returns false when outside geofence', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { geofences: [] }
      });

      const result = await radarService.isInGeofence('user123', 37.7749, -122.4194, 'test-fence');

      expect(result).toBe(false);
    });
  });

  describe('validateAddress', () => {
    test('validates allowed address', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            addresses: [{
              latitude: 37.7749,
              longitude: -122.4194
            }]
          }
        })
        .mockResolvedValueOnce({
          data: { context: mockContext }
        });

      const result = await radarService.validateAddress('123 Main St, San Francisco, CA');

      expect(result).toBe(true);
    });

    test('invalidates restricted address', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({
          data: {
            addresses: [{
              latitude: 40.7128,
              longitude: -74.0060
            }]
          }
        })
        .mockResolvedValueOnce({
          data: {
            context: {
              ...mockContext,
              state: { code: 'NY', name: 'New York' }
            }
          }
        });

      const result = await radarService.validateAddress('123 Main St, New York, NY');

      expect(result).toBe(false);
    });
  });
});