import { VeriffService } from '../../../services/veriff/VeriffService';
import axios from 'axios';
import logger from '../../../utils/logger';

jest.mock('axios');
jest.mock('../../../utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('VeriffService', () => {
  let service: VeriffService;

  beforeEach(() => {
    service = new VeriffService();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    const mockSessionConfig = {
      person: {
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        idNumber: '123456789'
      },
      document: {
        type: 'ID_CARD' as const,
        country: 'US'
      }
    };

    const mockResponse = {
      id: 'session_123',
      status: 'created',
      verification: {
        id: 'verification_123',
        url: 'https://veriff.com/session/123',
        host: 'veriff.com',
        status: 'created',
        sessionToken: 'token_123'
      }
    };

    test('creates verification session successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await service.createSession(mockSessionConfig);

      expect(result).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/sessions'),
        expect.objectContaining({
          verification: expect.objectContaining({
            person: mockSessionConfig.person,
            document: mockSessionConfig.document
          })
        }),
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith('Veriff session created', expect.any(Object));
    });

    test('handles creation error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.createSession(mockSessionConfig))
        .rejects.toThrow('Failed to create verification session');
      expect(logger.error).toHaveBeenCalledWith('Error creating Veriff session', expect.any(Object));
    });
  });

  describe('getSessionStatus', () => {
    test('retrieves session status successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { verification: { status: 'approved' } }
      });

      const status = await service.getSessionStatus('session_123');

      expect(status).toBe('approved');
      expect(logger.info).toHaveBeenCalledWith('Veriff session status retrieved', expect.any(Object));
    });

    test('handles status retrieval error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getSessionStatus('session_123'))
        .rejects.toThrow('Failed to get verification status');
      expect(logger.error).toHaveBeenCalledWith('Error getting Veriff session status', expect.any(Object));
    });
  });

  describe('getVerificationDetails', () => {
    test('retrieves verification details successfully', async () => {
      const mockDetails = {
        id: 'session_123',
        verification: {
          status: 'approved',
          person: {
            firstName: 'John',
            lastName: 'Doe'
          }
        }
      };

      mockedAxios.get.mockResolvedValueOnce({ data: mockDetails });

      const result = await service.getVerificationDetails('session_123');

      expect(result).toEqual(mockDetails);
      expect(logger.info).toHaveBeenCalledWith('Veriff verification details retrieved', expect.any(Object));
    });

    test('handles details retrieval error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getVerificationDetails('session_123'))
        .rejects.toThrow('Failed to get verification details');
      expect(logger.error).toHaveBeenCalledWith('Error getting verification details', expect.any(Object));
    });
  });
});