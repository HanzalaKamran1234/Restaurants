import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { profileId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(addresses);
  } catch (error: any) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ message: 'Error retrieving addresses', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, fullAddress, city, province, postalCode, phone } = await req.json();

    if (!title || !fullAddress || !city || !province) {
      return NextResponse.json({ message: 'Title, fullAddress, city, and province are required' }, { status: 400 });
    }

    const existingCount = await prisma.address.count({ where: { profileId: userId } });
    const isDefault = existingCount === 0;

    const newAddress = await prisma.address.create({
      data: {
        profileId: userId,
        title,
        fullAddress,
        city,
        province,
        postalCode: postalCode || '74600',
        phone: phone || null,
        isDefault,
      }
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error: any) {
    console.error('Error creating address:', error);
    return NextResponse.json({ message: 'Error saving address', error: error.message }, { status: 500 });
  }
}
