import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { body, validationResult } from 'express-validator';
import { KYCService } from '../services/kycService';

const router = express.Router();

router.post('/submit', authMiddleware, [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('dateOfBirth').isDate().withMessage('Valid date of birth is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('idNumber').notEmpty().withMessage('ID number is required'),
  body('idFrontImage').notEmpty().withMessage('ID front image is required'),
  body('idBackImage').notEmpty().withMessage('ID back image is required'),
  body('selfieImage').notEmpty().withMessage('Selfie image is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const kycData = {
      userId: req.userId,
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      address: req.body.address,
      idNumber: req.body.idNumber,
      idFrontImage: req.body.idFrontImage,
      idBackImage: req.body.idBackImage,
      selfieImage: req.body.selfieImage,
    };

    const result = await KYCService.submitKYC(kycData);
    res.json({ message: 'KYC submitted successfully', status: result.status, applicationId: result.applicationId });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting KYC', error: error.message });
  }
});

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const status = await KYCService.getKYCStatus(req.userId);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching KYC status', error: error.message });
  }
});

export default router;