import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. Delivery Area Operations
export const getDeliveryAreas = async (req: Request, res: Response) => {
  try {
    const areas = await prisma.deliveryArea.findMany();
    return res.json(areas);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching delivery areas', error: error.message });
  }
};

export const updateDeliveryArea = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { deliveryCharge, estimatedTime, minOrderAmount, available } = req.body;

  try {
    const updated = await prisma.deliveryArea.update({
      where: { id },
      data: {
        deliveryCharge: deliveryCharge !== undefined ? parseFloat(deliveryCharge) : undefined,
        estimatedTime: estimatedTime || undefined,
        minOrderAmount: minOrderAmount !== undefined ? parseFloat(minOrderAmount) : undefined,
        available: available !== undefined ? Boolean(available) : undefined
      }
    });
    return res.json({ message: 'Delivery area updated successfully', area: updated });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating delivery area', error: error.message });
  }
};

// 2. Contact Message Operations
export const submitContactMessage = async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  try {
    const msg = await prisma.contactMessage.create({
      data: { name, email, subject, message }
    });
    return res.status(201).json({ message: 'Message sent successfully.', data: msg });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

export const getContactMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return res.json(messages);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching contact messages', error: error.message });
  }
};

// 3. Newsletter Subscription
export const subscribeNewsletter = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true },
      create: { email }
    });
    return res.status(201).json({ message: 'Subscribed successfully.', data: subscriber });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error subscribing to newsletter', error: error.message });
  }
};
