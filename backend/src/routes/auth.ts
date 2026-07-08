import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  getAddresses,
  addAddress,
  deleteAddress,
  getFavorites,
  toggleFavorite
} from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticateToken, getProfile);

// Addresses
router.get('/addresses', authenticateToken, getAddresses);
router.post('/addresses', authenticateToken, addAddress);
router.delete('/addresses/:id', authenticateToken, deleteAddress);

// Favorites
router.get('/favorites', authenticateToken, getFavorites);
router.post('/favorites/:itemId', authenticateToken, toggleFavorite);

export default router;
