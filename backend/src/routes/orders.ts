import { Router, Response, NextFunction } from 'express';
import {
  createOrder,
  getOrderById,
  getUserOrders,
  getAdminOrders,
  updateOrderStatus,
} from '../controllers/orderController';
import { authenticateToken, requireRole, AuthRequest } from '../middlewares/authMiddleware';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ziyafat_secret_key_12345';

const optionalAuthenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid, continue as guest
    next();
  }
};

const router = Router();

router.post('/', optionalAuthenticateToken, createOrder);
router.get('/user', authenticateToken, getUserOrders);
router.get('/admin', authenticateToken, requireRole('ADMIN'), getAdminOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authenticateToken, requireRole('ADMIN'), updateOrderStatus);

export default router;
