import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// 1. Collection Operations (Replacing Delivery Area Operations)
export const getCollections = async (req: Request, res: Response) => {
  try {
    const list = await prisma.collection.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching collections', error: error.message });
  }
};

export const createCollection = async (req: AuthRequest, res: Response) => {
  const { name, slug, description, image } = req.body;
  if (!name || !slug) {
    return res.status(400).json({ message: 'Name and slug are required' });
  }

  try {
    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: description || '',
        image: image || ''
      }
    });
    return res.status(201).json(collection);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating collection', error: error.message });
  }
};

export const updateCollection = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, slug, description, image, active } = req.body;

  try {
    const updated = await prisma.collection.update({
      where: { id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        description: description !== undefined ? description : undefined,
        image: image !== undefined ? image : undefined,
        active: active !== undefined ? Boolean(active) : undefined
      }
    });
    return res.json({ message: 'Collection updated successfully', collection: updated });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating collection', error: error.message });
  }
};

export const deleteCollection = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.collection.delete({ where: { id } });
    return res.json({ message: 'Collection deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting collection', error: error.message });
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
