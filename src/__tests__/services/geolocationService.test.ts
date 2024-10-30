import { GeolocationService } from '../../services/geolocationService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeolocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getUserLocation returns correct location data', async () => {
    const mockLocationData = {
      country: 'United States',
      region: 'California',
      city: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockLocationData });

    const ipAddress = '192.168.1.1';
    const result = await GeolocationService.getUserLocation(ipAddress);

    expect(result).toEqual(mockLocationData);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(ipAddress),
      expect.any(Object)
    );
  });

  test('isUserInAllowedRegion returns true for allowed region', async () => {
    const mockLocationData = {
      country: 'United States',
      region: 'California',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockLocationData });

    const ipAddress = '192.168.1.1';
    const result = await GeolocationService.isUserInAllowedRegion(ipAddress);

    expect(result).toBe(true);
  });

  test('isUserInAllowedRegion returns false for restricted region', async () => {
    const mockLocationData = {
      country: 'Restricted Country',
      region: 'Restricted Region',
    };

    mockedAxios.get.mockResolvedValueOnce({ data: mockLocationData });

    const ipAddress = '192.168.1.2';
    const result = await GeolocationService.isUserInAllowedRegion(ipAddress);

    expect(result).toBe(false);
  });

  test('getUserLocation throws error for invalid IP', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Invalid IP address'));

    const ipAddress = 'invalid_ip';
    await expect(GeolocationService.getUserLocation(ipAddress)).rejects.toThrow('Error fetching geolocation data');
  });
});