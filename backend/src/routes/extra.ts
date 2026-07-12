import { Router } from 'express';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  submitContactMessage,
  getContactMessages,
  subscribeNewsletter
} from '../controllers/extraController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Collections (replacing Delivery Areas)
router.get('/collections', getCollections);
router.post('/collections', authenticateToken, requireRole('ADMIN'), createCollection);
router.put('/collections/:id', authenticateToken, requireRole('ADMIN'), updateCollection);
router.delete('/collections/:id', authenticateToken, requireRole('ADMIN'), deleteCollection);

// Contact
router.post('/contact', submitContactMessage);
router.get('/contact', authenticateToken, requireRole('ADMIN'), getContactMessages);

// Newsletter
router.post('/newsletter', subscribeNewsletter);

export default router;
