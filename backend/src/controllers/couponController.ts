import { Request, Response } from 'express';
import { prisma } from '../config/db';

export const validateCoupon = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ message: 'Coupon code is required' });
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: String(code).toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Invalid coupon code' });
    }

    if (!coupon.active) {
      return res.status(400).json({ valid: false, message: 'This coupon is no longer active' });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ valid: false, message: 'This coupon has expired' });
    }

    return res.json({
      valid: true,
      discountPercent: coupon.discountPercent,
      maxDiscount: coupon.maxDiscount,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error validating coupon', error: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  const { code, discountPercent, maxDiscount, expiresAt } = req.body;

  if (!code || !discountPercent || !expiresAt) {
    return res.status(400).json({ message: 'Code, discountPercent, and expiresAt are required' });
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: String(code).toUpperCase(),
        discountPercent: parseFloat(discountPercent),
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        expiresAt: new Date(expiresAt),
      },
    });
    return res.status(201).json(coupon);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating coupon', error: error.message });
  }
};
