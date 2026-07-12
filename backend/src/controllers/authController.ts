import { Request, Response } from 'express';
import { prisma } from '../config/db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'ziyafat_secret_key_12345';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phone, whatsapp } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await prisma.profile.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate a mock ID (e.g. usr_xxxxxx) for local registration
    const mockId = `usr_${Math.random().toString(36).substring(2, 9)}`;

    const profile = await prisma.profile.create({
      data: {
        id: mockId,
        fullName: name,
        email,
        password: hashedPassword,
        phone,
        whatsapp,
        role: 'customer',
      },
    });

    const token = jwt.sign({ id: profile.id, email: profile.email, role: profile.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: {
        id: profile.id,
        name: profile.fullName,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        loyaltyPoints: 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const profile = await prisma.profile.findUnique({ where: { email } });
    if (!profile || !profile.password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, profile.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: profile.id, email: profile.email, role: profile.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: {
        id: profile.id,
        name: profile.fullName,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        loyaltyPoints: profile.loyaltyPoints,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: req.user.id },
      include: {
        addresses: true,
        favorites: {
          include: { product: { include: { images: true } } }
        }
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.json({
      user: {
        id: profile.id,
        name: profile.fullName,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        addresses: profile.addresses,
        favoriteItems: profile.favorites.map(f => f.product),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving profile', error: error.message });
  }
};

// ---------------- CUSTOMER ADDRESSES CMS ----------------
export const getAddresses = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const list = await prisma.address.findMany({
      where: { profileId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { title, fullAddress, city, province, postalCode, phone } = req.body;

  if (!title || !fullAddress || !city || !province) {
    return res.status(400).json({ message: 'Title, fullAddress, city, and province are required.' });
  }

  try {
    const existingCount = await prisma.address.count({ where: { profileId: req.user.id } });
    const isDefault = existingCount === 0;

    const address = await prisma.address.create({
      data: {
        profileId: req.user.id,
        title,
        fullAddress,
        city,
        province,
        postalCode: postalCode || '74600',
        phone: phone || null,
        isDefault
      }
    });
    return res.status(201).json(address);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error saving address', error: error.message });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { id } = req.params;

  try {
    const target = await prisma.address.findFirst({
      where: { id, profileId: req.user.id }
    });

    if (!target) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    await prisma.address.delete({ where: { id } });
    return res.json({ message: 'Address deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// ---------------- FAVORITE ITEMS CMS ----------------
export const getFavorites = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const list = await prisma.favorite.findMany({
      where: { profileId: req.user.id },
      include: { product: { include: { images: true } } }
    });
    return res.json(list.map(fav => fav.product));
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { itemId } = req.params; // product ID

  try {
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        profileId_productId: {
          profileId: req.user.id,
          productId: itemId
        }
      }
    });

    if (existingFavorite) {
      await prisma.favorite.delete({ where: { id: existingFavorite.id } });
      return res.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      await prisma.favorite.create({
        data: {
          profileId: req.user.id,
          productId: itemId
        }
      });
      return res.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
};
