import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../utils/db';

export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(collections);
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return NextResponse.json({ message: 'Error retrieving collections', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const { name, slug, description, image } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description: description || '',
        image: image || ''
      }
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error: any) {
    console.error('Error creating collection:', error);
    return NextResponse.json({ message: 'Error creating collection', error: error.message }, { status: 500 });
  }
}
