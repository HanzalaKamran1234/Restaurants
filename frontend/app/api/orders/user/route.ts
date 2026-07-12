import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { profileId: userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true }
            },
            variant: true
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json({ message: 'Error retrieving user orders', error: error.message }, { status: 500 });
  }
}
