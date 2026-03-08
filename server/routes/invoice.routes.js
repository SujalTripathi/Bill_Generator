import { Router } from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  parseWithAI,
  createInvoice,
  getInvoices,
  getStats,
  getInvoice,
  getPublicInvoice,
  updateInvoice,
  updateStatus,
  deleteInvoice,
  duplicateInvoice,
  sendWhatsApp,
} from '../controllers/invoice.controller.js';

const router = Router();

// Public route (no auth)
router.get('/public/:token', getPublicInvoice);

// Protected routes
router.use(protect);

router.post('/parse', parseWithAI);
router.post('/', createInvoice);
router.get('/', getInvoices);
router.get('/stats', getStats);
router.get('/:id', getInvoice);
router.put('/:id', updateInvoice);
router.put('/:id/status', updateStatus);
router.delete('/:id', deleteInvoice);
router.post('/:id/duplicate', duplicateInvoice);
router.post('/:id/send-whatsapp', sendWhatsApp);

export default router;
