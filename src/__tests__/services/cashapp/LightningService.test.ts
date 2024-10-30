import { CashAppLightningService } from '../../../services/cashapp/LightningService';
import axios from 'axios';
import logger from '../../../utils/logger';

jest.mock('axios');
jest.mock('../../../utils/logger');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CashAppLightningService', () => {
  let service: CashAppLightningService;

  beforeEach(() => {
    service = new CashAppLightningService();
    jest.clearAllMocks();
  });

  describe('createInvoice', () => {
    const mockInvoiceResponse = {
      id: 'inv_123',
      lnInvoice: 'lnbc...',
      qrCode: 'data:image/png;base64,...',
      status: 'PENDING',
      expiresAt: '2023-07-01T12:00:00Z'
    };

    test('creates lightning invoice successfully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockInvoiceResponse });

      const result = await service.createInvoice(10.00, 'Test payment');

      expect(result).toEqual(mockInvoiceResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/invoices'),
        {
          amount: { currency: 'USD', value: '10.00' },
          memo: 'Test payment',
          network: 'LIGHTNING'
        },
        expect.any(Object)
      );
      expect(logger.info).toHaveBeenCalledWith('Lightning invoice created', expect.any(Object));
    });

    test('handles creation error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.createInvoice(10.00, 'Test payment'))
        .rejects.toThrow('Failed to create Lightning invoice');
      expect(logger.error).toHaveBeenCalledWith('Error creating Lightning invoice', expect.any(Object));
    });
  });

  describe('getInvoiceStatus', () => {
    test('retrieves invoice status successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'PAID' }
      });

      const status = await service.getInvoiceStatus('inv_123');

      expect(status).toBe('PAID');
      expect(logger.info).toHaveBeenCalledWith('Lightning invoice status retrieved', expect.any(Object));
    });

    test('handles status retrieval error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getInvoiceStatus('inv_123'))
        .rejects.toThrow('Failed to get invoice status');
      expect(logger.error).toHaveBeenCalledWith('Error getting Lightning invoice status', expect.any(Object));
    });
  });

  describe('waitForPayment', () => {
    test('returns true when payment is received', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: { status: 'PENDING' } })
        .mockResolvedValueOnce({ data: { status: 'PAID' } });

      const result = await service.waitForPayment('inv_123', 1);

      expect(result).toBe(true);
    });

    test('returns false when invoice expires', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: { status: 'PENDING' } })
        .mockResolvedValueOnce({ data: { status: 'EXPIRED' } });

      const result = await service.waitForPayment('inv_123', 1);

      expect(result).toBe(false);
    });
  });
});