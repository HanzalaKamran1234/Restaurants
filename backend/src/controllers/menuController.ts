import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

// Categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
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

// Products (replacing Menu Items)
export const getMenuItems = async (req: Request, res: Response) => {
  const { category, collection, search, size, color, minPrice, maxPrice, sort } = req.query;

  try {
    const whereClause: any = { available: true };

    if (category) {
      whereClause.category = { slug: String(category) };
    }

    if (collection) {
      whereClause.collection = { slug: String(collection) };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
        { fabric: { contains: String(search) } },
      ];
    }

    if (size) {
      whereClause.variants = {
        some: { size: String(size) }
      };
    }

    if (color) {
      if (whereClause.variants) {
        whereClause.variants.some.color = String(color);
      } else {
        whereClause.variants = {
          some: { color: String(color) }
        };
      }
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

    const items = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        collection: true,
        images: true,
        variants: true,
      },
      orderBy,
    });

    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const item = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        images: true,
        variants: true,
        reviews: {
          include: { profile: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(item);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving product details', error: error.message });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  const {
    name,
    description,
    price,
    discount,
    fabric,
    fit,
    shippingInfo,
    returnsInfo,
    categoryId,
    collectionId,
    image, // Primary image url
    gallery, // Array of extra image URLs
    variants, // Array of { color, size, inventory }
  } = req.body;

  if (!name || !price || !categoryId || !image) {
    return res.status(400).json({ message: 'Name, price, categoryId, and primary image are required' });
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(price),
          discount: discount ? parseFloat(discount) : 0,
          fabric: fabric || '100% Cotton',
          fit: fit || 'Relaxed Fit',
          shippingInfo: shippingInfo || undefined,
          returnsInfo: returnsInfo || undefined,
          categoryId,
          collectionId: collectionId || null,
        }
      });

      // Save primary image
      await tx.productImage.create({
        data: { url: image, productId: prod.id }
      });

      // Save gallery images
      if (Array.isArray(gallery)) {
        for (const url of gallery) {
          if (url) {
            await tx.productImage.create({ data: { url, productId: prod.id } });
          }
        }
      }

      // Save variants
      if (Array.isArray(variants)) {
        for (const v of variants) {
          if (v.color && v.size) {
            await tx.productVariant.create({
              data: {
                productId: prod.id,
                color: v.color,
                size: v.size,
                inventory: parseInt(v.inventory) || 0,
                sku: `${name.substring(0, 3).toUpperCase()}-${v.color.substring(0, 2).toUpperCase()}-${v.size}-${prod.id.substring(0, 4).toUpperCase()}`
              }
            });
          }
        }
      }

      return prod;
    });

    return res.status(201).json(product);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.discount !== undefined) data.discount = parseFloat(data.discount);
    if (data.available !== undefined) data.available = Boolean(data.available);

    const updated = await prisma.$transaction(async (tx) => {
      const { variants, images, category, collection, ...directFields } = data;

      const prod = await tx.product.update({
        where: { id },
        data: directFields,
      });

      if (Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const v of variants) {
          if (v.color && v.size) {
            await tx.productVariant.create({
              data: {
                productId: id,
                color: v.color,
                size: v.size,
                inventory: parseInt(v.inventory) || 0,
                sku: `${prod.name.substring(0, 3).toUpperCase()}-${v.color.substring(0, 2).toUpperCase()}-${v.size}-${prod.id.substring(0, 4).toUpperCase()}`
              }
            });
          }
        }
      }

      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        for (const img of images) {
          if (img.url) {
            await tx.productImage.create({ data: { url: img.url, productId: id } });
          }
        }
      }

      return prod;
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id } });
    return res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// Reviews
export const addReview = async (req: AuthRequest, res: Response) => {
  const { productId, rating, comment } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!productId || !rating || !comment) {
    return res.status(400).json({ message: 'productId, rating, and comment are required' });
  }

  try {
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        profileId: req.user.id,
        productId,
      },
    });

    // Update Average Rating
    const reviews = await prisma.review.findMany({ where: { productId } });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: { rating: parseFloat(avgRating.toFixed(1)) },
    });

    return res.status(201).json(review);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error adding review', error: error.message });
  }
};
