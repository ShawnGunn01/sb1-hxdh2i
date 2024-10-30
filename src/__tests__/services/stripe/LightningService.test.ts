import { StripeLightningService } from '../../../services/stripe/LightningService';
import Stripe from 'stripe';
import logger from '../../../utils/logger';

jest.mock('stripe');
jest.mock('../../../utils/logger');

describe('StripeLightningService', () => {
  let service: StripeLightningService;
  let mockStripe: jest.Mocked<Stripe>;

  beforeEach(() => {
    mockStripe = {
      paymentIntents: {
        create: jest.fn(),
        confirm: jest.fn(),
        retrieve: jest.fn(),
      }
    } as any;

    (Stripe as jest.Mock).mockImplementation(() => mockStripe);
    service = new StripeLightningService();
  });

  describe('createLightningInvoice', () => {
    const mockPaymentIntent = {
      id: 'pi_123',
      client_secret: 'secret_123',
      status: 'requires_payment_method',
    };

    test('creates lightning invoice successfully', async () => {
      mockStripe.paymentIntents.create.mockResolvedValueOnce(mockPaymentIntent);

      const result = await service.createLightningInvoice(10.00, 'Test payment');

      expect(result).toEqual({
        id: mockPaymentIntent.id,
        clientSecret: mockPaymentIntent.client_secret,
        amount: 10.00,
        status: mockPaymentIntent.status,
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 1000,
        currency: 'usd',
        payment_method_types: ['lightning'],
        description: 'Test payment',
      });

      expect(logger.info).toHaveBeenCalledWith('Stripe Lightning invoice created', expect.any(Object));
    });

    test('handles creation error', async () => {
      mockStripe.paymentIntents.create.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.createLightningInvoice(10.00, 'Test payment'))
        .rejects.toThrow('Failed to create Lightning invoice');
      expect(logger.error).toHaveBeenCalledWith('Error creating Stripe Lightning invoice', expect.any(Object));
    });
  });

  describe('confirmLightningPayment', () => {
    test('confirms payment successfully', async () => {
      mockStripe.paymentIntents.confirm.mockResolvedValueOnce({
        id: 'pi_123',
        status: 'succeeded',
      } as any);

      const result = await service.confirmLightningPayment('pi_123');

      expect(result).toBe(true);
      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(
        'pi_123',
        { payment_method: 'lightning' }
      );
      expect(logger.info).toHaveBeenCalledWith('Stripe Lightning payment confirmed', expect.any(Object));
    });

    test('handles confirmation error', async () => {
      mockStripe.paymentIntents.confirm.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.confirmLightningPayment('pi_123'))
        .rejects.toThrow('Failed to confirm Lightning payment');
      expect(logger.error).toHaveBeenCalledWith('Error confirming Lightning payment', expect.any(Object));
    });
  });

  describe('getLightningPaymentStatus', () => {
    test('retrieves payment status successfully', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValueOnce({
        id: 'pi_123',
        status: 'succeeded',
      } as any);

      const status = await service.getLightningPaymentStatus('pi_123');

      expect(status).toBe('succeeded');
      expect(logger.info).toHaveBeenCalledWith('Stripe Lightning payment status retrieved', expect.any(Object));
    });

    test('handles status retrieval error', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.getLightningPaymentStatus('pi_123'))
        .rejects.toThrow('Failed to get Lightning payment status');
      expect(logger.error).toHaveBeenCalledWith('Error getting Lightning payment status', expect.any(Object));
    });
  });
});