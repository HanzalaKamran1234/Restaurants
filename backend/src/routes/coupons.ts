import { Router } from 'express';
import { validateCoupon, createCoupon } from '../controllers/couponController';
import { authenticateToken, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.get('/validate', validateCoupon);
router.post('/', authenticateToken, requireRole('ADMIN'), createCoupon);

export default router;
