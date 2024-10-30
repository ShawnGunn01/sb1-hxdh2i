import { Request, Response } from 'express';
import { stripeLightningService } from '../services/stripe/LightningService';
import { cashAppLightningService } from '../services/cashapp/LightningService';
import logger from '../utils/logger';

export const createLightningInvoice = async (req: Request, res: Response) => {
  try {
    const { amount, description, provider = 'stripe' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: 'Invalid amount specified'
      });
    }

    let invoice;
    if (provider === 'stripe') {
      invoice = await stripeLightningService.createLightningInvoice(
        amount,
        description || 'PLLAY Payment'
      );
    } else if (provider === 'cashapp') {
      invoice = await cashAppLightningService.createInvoice(
        amount,
        description || 'PLLAY Payment'
      );
    } else {
      return res.status(400).json({
        message: 'Invalid payment provider specified'
      });
    }

    res.json({
      invoiceId: invoice.id,
      clientSecret: invoice.clientSecret,
      lnInvoice: invoice.lnInvoice,
      qrCode: invoice.qrCode,
      expiresAt: invoice.expiresAt,
      provider
    });
  } catch (error) {
    logger.error('Error creating Lightning invoice', { error });
    res.status(500).json({
      message: 'Failed to create Lightning invoice'
    });
  }
};

export const getLightningInvoiceStatus = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const { provider = 'stripe' } = req.query;

    let status;
    if (provider === 'stripe') {
      status = await stripeLightningService.getLightningPaymentStatus(invoiceId);
    } else if (provider === 'cashapp') {
      status = await cashAppLightningService.getInvoiceStatus(invoiceId);
    } else {
      return res.status(400).json({
        message: 'Invalid payment provider specified'
      });
    }

    res.json({ status, provider });
  } catch (error) {
    logger.error('Error getting Lightning invoice status', { error, invoiceId: req.params.invoiceId });
    res.status(500).json({
      message: 'Failed to get invoice status'
    });
  }
};

export const confirmLightningPayment = async (req: Request, res: Response) => {
  try {
    const { invoiceId } = req.params;
    const { provider = 'stripe' } = req.body;

    let success;
    if (provider === 'stripe') {
      success = await stripeLightningService.confirmLightningPayment(invoiceId);
    } else if (provider === 'cashapp') {
      success = await cashAppLightningService.waitForPayment(invoiceId);
    } else {
      return res.status(400).json({
        message: 'Invalid payment provider specified'
      });
    }

    if (success) {
      res.json({ message: 'Payment confirmed successfully' });
    } else {
      res.status(400).json({ message: 'Payment confirmation failed' });
    }
  } catch (error) {
    logger.error('Error confirming Lightning payment', { error, invoiceId: req.params.invoiceId });
    res.status(500).json({
      message: 'Failed to confirm payment'
    });
  }
};