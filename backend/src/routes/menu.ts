import { Router } from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addReview,
} from '../controllers/menuController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authenticateToken, requireRole('ADMIN'), createMenuItem);
router.put('/:id', authenticateToken, requireRole('ADMIN'), updateMenuItem);
router.delete('/:id', authenticateToken, requireRole('ADMIN'), deleteMenuItem);
router.post('/review', authenticateToken, addReview);

export default router;
