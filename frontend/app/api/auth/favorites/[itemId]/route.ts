import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../../utils/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await params;

    // Check if favorite already exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        profileId_menuItemId: {
          profileId: userId,
          menuItemId: itemId,
        },
      },
    });

    if (existingFavorite) {
      // If it exists, remove it
      await prisma.favorite.delete({
        where: {
          id: existingFavorite.id,
        },
      });
      return NextResponse.json({ message: 'Removed from favorites', isFavorite: false });
    } else {
      // If it does not exist, add it
      await prisma.favorite.create({
        data: {
          profileId: userId,
          menuItemId: itemId,
        },
      });
      return NextResponse.json({ message: 'Added to favorites', isFavorite: true });
    }
  } catch (error: any) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json({ message: 'Error toggling favorite', error: error.message }, { status: 500 });
  }
}
