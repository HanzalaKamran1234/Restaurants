import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

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

    await prisma.collection.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting collection:', error);
    return NextResponse.json({ message: 'Error deleting collection', error: error.message }, { status: 500 });
  }
}
