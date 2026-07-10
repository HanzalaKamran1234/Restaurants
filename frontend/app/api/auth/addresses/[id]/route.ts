import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../../utils/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const address = await prisma.address.findFirst({
      where: { id, profileId: userId },
    });

    if (!address) {
      return NextResponse.json({ message: 'Address not found or unauthorized' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Address deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ message: 'Error deleting address', error: error.message }, { status: 500 });
  }
}
