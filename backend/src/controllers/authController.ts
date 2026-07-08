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
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        whatsapp,
        role: 'CUSTOMER',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
        loyaltyPoints: 0,
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
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        addresses: {
          include: { area: true }
        },
        favoriteItems: true
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        whatsapp: user.whatsapp,
        addresses: user.addresses,
        favoriteItems: user.favoriteItems,
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
    const list = await prisma.customerAddress.findMany({
      where: { userId: req.user.id },
      include: { area: true }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching addresses', error: error.message });
  }
};

export const addAddress = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { title, areaId, landmark, fullAddress } = req.body;

  if (!title || !areaId || !fullAddress) {
    return res.status(400).json({ message: 'Title, areaId, and fullAddress are required.' });
  }

  try {
    const address = await prisma.customerAddress.create({
      data: {
        userId: req.user.id,
        title,
        areaId,
        landmark,
        fullAddress
      },
      include: { area: true }
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
    const target = await prisma.customerAddress.findFirst({
      where: { id, userId: req.user.id }
    });

    if (!target) {
      return res.status(404).json({ message: 'Address not found or unauthorized' });
    }

    await prisma.customerAddress.delete({ where: { id } });
    return res.json({ message: 'Address deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting address', error: error.message });
  }
};

// ---------------- FAVORITE ITEMS CMS ----------------
export const getFavorites = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const u = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { favoriteItems: true }
    });
    return res.json(u?.favoriteItems || []);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  const { itemId } = req.params;

  try {
    const userWithFavs = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { favoriteItems: true }
    });

    if (!userWithFavs) return res.status(404).json({ message: 'User not found' });

    const isFav = userWithFavs.favoriteItems.some(item => item.id === itemId);

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        favoriteItems: isFav
          ? { disconnect: { id: itemId } }
          : { connect: { id: itemId } }
      },
      include: { favoriteItems: true }
    });

    return res.json({
      message: isFav ? 'Removed from favorites' : 'Added to favorites',
      favoriteItems: updatedUser.favoriteItems
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error toggling favorite', error: error.message });
  }
};
