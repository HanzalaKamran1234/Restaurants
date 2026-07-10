import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: {
            profile: {
              select: { fullName: true }
            }
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    // Remap user.name to match frontend expectation
    const formattedReviews = item.reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: {
        name: review.profile.fullName
      }
    }));

    return NextResponse.json({
      ...item,
      reviews: formattedReviews
    });
  } catch (error: any) {
    console.error('Error fetching menu item by id:', error);
    return NextResponse.json({ message: 'Error retrieving menu item', error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data: any = { ...body };

    // Format fields correctly
    if (data.price !== undefined) data.price = parseFloat(data.price);
    if (data.discount !== undefined) data.discount = parseFloat(data.discount);
    if (data.calories !== undefined) data.calories = data.calories ? parseInt(data.calories) : null;
    if (data.prepTime !== undefined) data.prepTime = parseInt(data.prepTime);
    if (data.available !== undefined) data.available = Boolean(data.available);

    if (data.sizes !== undefined) {
      data.sizes = typeof data.sizes === 'object' ? JSON.stringify(data.sizes) : data.sizes;
    }

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ message: 'Error updating menu item', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ message: 'Error deleting menu item', error: error.message }, { status: 500 });
  }
}
