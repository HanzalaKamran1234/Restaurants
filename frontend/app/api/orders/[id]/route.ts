import { NextResponse } from 'next/server';
import { prisma } from '../../../../utils/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Error fetching order by id:', error);
    return NextResponse.json({ message: 'Error retrieving order', error: error.message }, { status: 500 });
  }
}
