import { Router } from 'express';
import {
  getDeliveryAreas,
  updateDeliveryArea,
  submitContactMessage,
  getContactMessages,
  subscribeNewsletter
} from '../controllers/extraController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Delivery
router.get('/delivery-areas', getDeliveryAreas);
router.put('/delivery-areas/:id', authenticateToken, requireRole('ADMIN'), updateDeliveryArea);

// Contact
router.post('/contact', submitContactMessage);
router.get('/contact', authenticateToken, requireRole('ADMIN'), getContactMessages);

// Newsletter
router.post('/newsletter', subscribeNewsletter);

export default router;
