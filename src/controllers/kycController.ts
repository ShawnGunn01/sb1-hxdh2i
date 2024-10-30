import { Request, Response } from 'express';
import { kycService } from '../services/kycService';
import { locationService } from '../services/location/LocationService';
import logger from '../utils/logger';

export const initiateKYC = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { latitude, longitude } = req.body.deviceLocation || {};

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: 'Device location settings must be enabled to verify eligibility.'
      });
    }

    const kycData = {
      ...req.body,
      deviceLocation: { latitude, longitude }
    };

    const result = await kycService.submitKYC(userId, kycData);

    if (result.status === 'rejected') {
      return res.status(400).json({
        message: result.message
      });
    }

    res.json({
      status: result.status,
      applicationId: result.applicationId,
      message: result.message
    });
  } catch (error) {
    logger.error('Error initiating KYC', { error, userId: req.userId });
    res.status(500).json({ message: 'Error initiating KYC process' });
  }
};

export const getKYCStatus = async (req: Request, res: Response) => {
  try {
    const status = await kycService.getKYCStatus(req.userId);
    res.json({ status });
  } catch (error) {
    logger.error('Error getting KYC status', { error, userId: req.userId });
    res.status(500).json({ message: 'Error fetching KYC status' });
  }
};

export const updateKYC = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    const result = await kycService.updateKYC(userId, updateData);

    if (result.status === 'rejected') {
      return res.status(400).json({
        message: result.message
      });
    }

    res.json({
      status: result.status,
      message: result.message
    });
  } catch (error) {
    logger.error('Error updating KYC', { error, userId: req.userId });
    res.status(500).json({ message: 'Error updating KYC information' });
  }
};

export const handleVeriffCallback = async (req: Request, res: Response) => {
  try {
    const { sessionId, status, verification } = req.body;

    // Handle the verification result
    logger.info('Received Veriff callback', {
      sessionId,
      status,
      verificationDetails: verification
    });

    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error handling Veriff callback', { error });
    res.status(500).json({ message: 'Error processing verification callback' });
  }
};