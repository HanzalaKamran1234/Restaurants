import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../utils/db';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    // Remap response items to match the count format expected by components
    const formattedCategories = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      _count: {
        items: cat._count.menuItems,
      },
    }));

    return NextResponse.json(formattedCategories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: 'Error retrieving categories', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const { name, slug, image } = await req.json();

    if (!name || !slug || !image) {
      return NextResponse.json({ message: 'Name, slug, and image are required' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug, image },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ message: 'Error creating category', error: error.message }, { status: 500 });
  }
}
