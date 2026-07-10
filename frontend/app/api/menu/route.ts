import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../utils/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const spiceLevel = searchParams.get('spiceLevel');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort');

    const whereClause: any = {};

    if (category) {
      whereClause.category = { slug: category };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { ingredients: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (spiceLevel) {
      whereClause.spiceLevel = spiceLevel.toUpperCase();
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
    }

    const items = await prisma.menuItem.findMany({
      where: whereClause,
      include: { category: true },
      orderBy,
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json({ message: 'Error retrieving menu items', error: error.message }, { status: 500 });
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
    } = await req.json();

    if (!name || !price || !categoryId || !image) {
      return NextResponse.json({ message: 'Name, price, categoryId, and image are required' }, { status: 400 });
    }

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

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ message: 'Error creating menu item', error: error.message }, { status: 500 });
  }
}
