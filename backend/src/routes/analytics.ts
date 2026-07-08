import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/dashboard', authenticateToken, requireRole('ADMIN'), getDashboardAnalytics);

export default router;
