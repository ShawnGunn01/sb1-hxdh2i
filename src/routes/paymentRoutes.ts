import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { rbacMiddleware } from '../middleware/rbacMiddleware';
import {
  createLightningInvoice,
  getLightningInvoiceStatus,
  confirmLightningPayment
} from '../controllers/paymentController';

const router = express.Router();

router.use(authMiddleware);

// Lightning Network routes
router.post('/lightning/invoice', rbacMiddleware('manage_payments'), createLightningInvoice);
router.get('/lightning/invoice/:invoiceId', rbacMiddleware('manage_payments'), getLightningInvoiceStatus);
router.post('/lightning/invoice/:invoiceId/confirm', rbacMiddleware('manage_payments'), confirmLightningPayment);

export default router;