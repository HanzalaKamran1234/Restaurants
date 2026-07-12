import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../utils/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const search = searchParams.get('search');
    const size = searchParams.get('size');
    const color = searchParams.get('color');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    const whereClause: any = { available: true };

    if (category) {
      whereClause.category = { slug: category };
    }

    if (collection) {
      whereClause.collection = { slug: collection };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fabric: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Size / Color filter matching variants
    if (size !== null && size !== 'all') {
      whereClause.variants = {
        some: { size: size, inventory: { gte: 0 } }
      };
    }

    if (color !== null && color !== 'all') {
      if (whereClause.variants) {
        whereClause.variants.some.color = { contains: color, mode: 'insensitive' };
      } else {
        whereClause.variants = {
          some: { color: { contains: color, mode: 'insensitive' } }
        };
      }
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }

    let orderBy: any = { name: 'asc' };
    if (sort) {
      if (sort === 'price-low') orderBy = { price: 'asc' };
      else if (sort === 'price-high') orderBy = { price: 'desc' };
      else if (sort === 'rating') orderBy = { rating: 'desc' };
      else if (sort === 'newest') orderBy = { createdAt: 'desc' };
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

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Error retrieving products', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const {
      name,
      description,
      price,
      discount,
      fabric,
      fit,
      brand,
      shippingInfo,
      returnsInfo,
      categoryId,
      collectionId,
      image, // Primary image
      gallery, // Array of extra image URLs
      variants, // Array of { color, size, inventory }
    } = await req.json();

    if (!name || !price || !categoryId || !image) {
      return NextResponse.json({ message: 'Name, price, categoryId, and primary image are required' }, { status: 400 });
    }

    // Create Product transaction
    const product = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name,
          description: description || '',
          price: parseFloat(price),
          discount: discount ? parseFloat(discount) : 0,
          fabric: fabric || '100% Combed Cotton',
          fit: fit || 'Relaxed Fit',
          brand: brand || 'THE VESTRA',
          shippingInfo: shippingInfo || undefined,
          returnsInfo: returnsInfo || undefined,
          categoryId,
          collectionId: collectionId || null,
        }
      });

      // Save Primary image
      await tx.productImage.create({
        data: {
          url: image,
          productId: prod.id,
        }
      });

      // Save gallery images
      if (Array.isArray(gallery)) {
        for (const url of gallery) {
          if (url) {
            await tx.productImage.create({
              data: { url, productId: prod.id }
            });
          }
        }
      }

      // Save variants
      if (Array.isArray(variants)) {
        for (const variant of variants) {
          if (variant.color && variant.size) {
            await tx.productVariant.create({
              data: {
                productId: prod.id,
                color: variant.color,
                size: variant.size,
                inventory: parseInt(variant.inventory) || 0,
                sku: `${name.substring(0, 3).toUpperCase()}-${variant.color.substring(0, 2).toUpperCase()}-${variant.size}-${prod.id.substring(0, 4).toUpperCase()}`
              }
            });
          }
        }
      }

      return prod;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Error creating product', error: error.message }, { status: 500 });
  }
}
