import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../../utils/db';

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

    if (data.deliveryCharge !== undefined) data.deliveryCharge = parseFloat(data.deliveryCharge);
    if (data.minOrderAmount !== undefined) data.minOrderAmount = parseFloat(data.minOrderAmount);
    if (data.available !== undefined) data.available = Boolean(data.available);

    const updatedArea = await prisma.deliveryArea.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedArea);
  } catch (error: any) {
    console.error('Error updating delivery area:', error);
    return NextResponse.json({ message: 'Error updating delivery area', error: error.message }, { status: 500 });
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

    await prisma.deliveryArea.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Delivery area deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting delivery area:', error);
    return NextResponse.json({ message: 'Error deleting delivery area', error: error.message }, { status: 500 });
  }
}
