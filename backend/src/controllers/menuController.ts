import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { items: true } } },
    });
    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving categories', error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, slug, image } = req.body;
  if (!name || !slug || !image) {
    return res.status(400).json({ message: 'Name, slug, and image are required' });
  }

  try {
    const category = await prisma.category.create({
      data: { name, slug, image },
    });
    return res.status(201).json(category);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Menu Items
export const getMenuItems = async (req: Request, res: Response) => {
  const { category, search, spiceLevel, minPrice, maxPrice, sort } = req.query;

  try {
    const whereClause: any = {};

    if (category) {
      whereClause.category = { slug: String(category) };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
        { ingredients: { contains: String(search) } },
      ];
    }

    if (spiceLevel) {
      whereClause.spiceLevel = String(spiceLevel).toUpperCase();
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(String(minPrice));
      if (maxPrice) whereClause.price.lte = parseFloat(String(maxPrice));
    }

    let orderBy: any = { name: 'asc' };
    if (sort) {
      if (sort === 'price-low') orderBy = { price: 'asc' };
      else if (sort === 'price-high') orderBy = { price: 'desc' };
      else if (sort === 'rating') orderBy = { rating: 'desc' };
    }

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: { category: true },
      orderBy,
    });

    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving menu items', error: error.message });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving menu item', error: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  const {
    name,
    description,
    ingredients,
    calories,
    spiceLevel,
    servingSize,
    price,
    discount,
    available,
    prepTime,
    image,
    sizes,
    categoryId,
  } = req.body;

  if (!name || !price || !categoryId || !image) {
    return res.status(400).json({ message: 'Name, price, categoryId, and image are required' });
  }

  try {
    const serializedSizes = typeof sizes === 'object' ? JSON.stringify(sizes) : (sizes || '[]');

    const item = await prisma.menuItem.create({
      data: {
        name,
        description: description || '',
        ingredients: ingredients || '',
        calories: calories ? parseInt(calories) : null,
        spiceLevel: spiceLevel || 'NONE',
        servingSize: servingSize || '1 Person',
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 0,
        available: available !== undefined ? Boolean(available) : true,
        prepTime: prepTime ? parseInt(prepTime) : 15,
        image,
        sizes: serializedSizes,
        categoryId,
      },
    });
    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating menu item', error: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    // Parse numeric fields if they are sent in request body
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.discount !== undefined) data.discount = parseFloat(data.discount);
    if (data.calories !== undefined) data.calories = data.calories ? parseInt(data.calories) : null;
    if (data.prepTime !== undefined) data.prepTime = parseInt(data.prepTime);
    if (data.available !== undefined) data.available = Boolean(data.available);

    if (data.sizes !== undefined) {
      data.sizes = typeof data.sizes === 'object' ? JSON.stringify(data.sizes) : data.sizes;
    }

    const item = await prisma.menuItem.update({
      where: { id },
      data,
    });
    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating menu item', error: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.menuItem.delete({ where: { id } });
    return res.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting menu item', error: error.message });
  }
};

// Reviews
export const addReview = async (req: AuthRequest, res: Response) => {
  const { menuItemId, rating, comment } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!menuItemId || !rating || !comment) {
    return res.status(400).json({ message: 'menuItemId, rating, and comment are required' });
  }

  try {
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        userId: req.user.id,
        menuItemId,
      },
    });

    // Update Average Rating
    const reviews = await prisma.review.findMany({ where: { menuItemId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: { rating: parseFloat(avgRating.toFixed(1)) },
    });

    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};
