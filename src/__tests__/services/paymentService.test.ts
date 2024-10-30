import { stripeService } from '../../services/stripeService';
import { paypalService } from '../../services/paypalService';
import { processPayment, createPayout } from '../../services/paymentService';
import { db } from '../../config/database';

jest.mock('../../services/stripeService');
jest.mock('../../services/paypalService');
jest.mock('../../config/database');

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('processPayment with Stripe', async () => {
    const mockPaymentIntent = { id: 'pi_123', status: 'succeeded' };
    (stripeService.createPaymentIntent as jest.Mock).mockResolvedValue(mockPaymentIntent);
    (stripeService.processPayment as jest.Mock).mockResolvedValue(mockPaymentIntent);

    const result = await processPayment('stripe', 100, 'usd', 'pi_123');

    expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(100, 'usd');
    expect(stripeService.processPayment).toHaveBeenCalledWith('pi_123');
    expect(result).toEqual({ success: true, transactionId: 'pi_123' });
  });

  test('processPayment with PayPal', async () => {
    const mockOrderId = 'order_123';
    const mockCaptureResult = { id: 'capture_123', status: 'COMPLETED' };
    (paypalService.createOrder as jest.Mock).mockResolvedValue(mockOrderId);
    (paypalService.capturePayment as jest.Mock).mockResolvedValue(mockCaptureResult);

    const result = await processPayment('paypal', 100, 'usd', 'token_123');

    expect(paypalService.createOrder).toHaveBeenCalledWith(100, 'usd');
    expect(paypalService.capturePayment).toHaveBeenCalledWith(mockOrderId);
    expect(result).toEqual({ success: true, transactionId: 'capture_123' });
  });

  test('createPayout with Stripe', async () => {
    const mockPayout = { id: 'po_123', status: 'paid' };
    (stripeService.createPayout as jest.Mock).mockResolvedValue(mockPayout);

    const result = await createPayout('stripe', 100, 'usd', 'user_123');

    expect(stripeService.createPayout).toHaveBeenCalledWith(100, 'usd');
    expect(result).toEqual({ success: true, transactionId: 'po_123' });
  });

  test('createPayout with PayPal', async () => {
    const mockPayout = { batch_header: { payout_batch_id: 'PAYOUTBATCHID' } };
    (paypalService.createPayout as jest.Mock).mockResolvedValue(mockPayout);

    const result = await createPayout('paypal', 100, 'usd', 'user@example.com');

    expect(paypalService.createPayout).toHaveBeenCalledWith('user@example.com', 100, 'usd');
    expect(result).toEqual({ success: true, transactionId: 'PAYOUTBATCHID' });
  });
});