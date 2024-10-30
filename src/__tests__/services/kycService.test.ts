import { kycService } from '../../services/kycService';
import axios from 'axios';
import logger from '../../utils/logger';

jest.mock('axios');
jest.mock('../../utils/logger');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('KYC Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('submitKYC successfully submits KYC data', async () => {
    const mockKycData = {
      userId: 'user123',
      fullName: 'John Doe',
      dateOfBirth: '1990-01-01',
      address: '123 Main St, City, Country',
      documentType: 'passport',
      documentNumber: 'AB123456',
    };

    const mockResponse = {
      status: 'pending',
      applicationId: 'kyc123',
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await kycService.submitKYC('user123', mockKycData);

    expect(result).toEqual(mockResponse);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/verify'),
      expect.objectContaining(mockKycData),
      expect.any(Object)
    );
    expect(logger.info).toHaveBeenCalledWith('KYC submission successful', expect.any(Object));
  });

  test('getKYCStatus returns correct status', async () => {
    const userId = 'user123';
    const mockStatus = 'approved';

    mockedAxios.get.mockResolvedValueOnce({ data: { status: mockStatus } });

    const result = await kycService.getKYCStatus(userId);

    expect(result).toBe(mockStatus);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(`/status/${userId}`),
      expect.any(Object)
    );
    expect(logger.info).toHaveBeenCalledWith('KYC status retrieved', expect.any(Object));
  });

  test('updateKYC successfully updates KYC data', async () => {
    const userId = 'user123';
    const mockUpdateData = {
      address: '456 New St, City, Country',
    };

    const mockResponse = {
      status: 'pending',
      applicationId: 'kyc123',
    };

    mockedAxios.put.mockResolvedValueOnce({ data: mockResponse });

    const result = await kycService.updateKYC(userId, mockUpdateData);

    expect(result).toEqual(mockResponse);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      expect.stringContaining(`/update/${userId}`),
      mockUpdateData,
      expect.any(Object)
    );
    expect(logger.info).toHaveBeenCalledWith('KYC update successful', expect.any(Object));
  });

  test('submitKYC throws error on API failure', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

    await expect(kycService.submitKYC('user123', {})).rejects.toThrow('Error submitting KYC');
    expect(logger.error).toHaveBeenCalledWith('Error submitting KYC', expect.any(Object));
  });

  test('getKYCStatus throws error on API failure', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

    await expect(kycService.getKYCStatus('user123')).rejects.toThrow('Error getting KYC status');
    expect(logger.error).toHaveBeenCalledWith('Error getting KYC status', expect.any(Object));
  });
});