import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET() {
  try {
    const areas = await prisma.deliveryArea.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(areas);
  } catch (error: any) {
    console.error('Error fetching delivery areas:', error);
    return NextResponse.json({ message: 'Error retrieving delivery areas', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const { name, deliveryCharge, estimatedTime, minOrderAmount } = await req.json();

    if (!name) {
      return NextResponse.json({ message: 'Name is required' }, { status: 400 });
    }

    const newArea = await prisma.deliveryArea.create({
      data: {
        name,
        deliveryCharge: deliveryCharge ? parseFloat(deliveryCharge) : 150,
        estimatedTime: estimatedTime || '30 Mins',
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 300,
        available: true,
      },
    });

    return NextResponse.json(newArea, { status: 201 });
  } catch (error: any) {
    console.error('Error creating delivery area:', error);
    return NextResponse.json({ message: 'Error creating delivery area', error: error.message }, { status: 500 });
  }
}
