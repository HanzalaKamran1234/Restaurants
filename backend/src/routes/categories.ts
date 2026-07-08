import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/menuController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getCategories);
router.post('/', authenticateToken, requireRole('ADMIN'), createCategory);

export default router;
