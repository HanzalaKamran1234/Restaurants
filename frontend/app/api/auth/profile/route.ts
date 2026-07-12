import { NextResponse } from 'next/server';
import { currentUser, auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ message: 'Clerk user not found' }, { status: 404 });
    }

    // Try to find the user in our database
    let profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        favorites: {
          include: {
            product: {
              include: { images: true }
            }
          },
        },
        notifications: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // Auto-sync: Create profile if it does not exist in our database yet
    if (!profile) {
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'THE VESTRA Member';
      const imageUrl = clerkUser.imageUrl || null;
      const phone = clerkUser.phoneNumbers[0]?.phoneNumber || null;

      // Determine role from public metadata (default: customer)
      const role = (clerkUser.publicMetadata?.role as string) || 'customer';

      profile = await prisma.profile.create({
        data: {
          id: userId,
          email,
          fullName,
          imageUrl,
          phone,
          role,
        },
        include: {
          addresses: true,
          favorites: {
            include: {
              product: {
                include: { images: true }
              }
            },
          },
          notifications: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        name: profile.fullName,
        email: profile.email,
        role: profile.role.toUpperCase(), // Match uppercase ADMIN/CUSTOMER
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        addresses: profile.addresses,
        favoriteItems: profile.favorites.map((fav) => fav.product),
        loyaltyPoints: profile.loyaltyPoints,
        notifications: profile.notifications,
      },
    });
  } catch (error: any) {
    console.error('Error in profile handler:', error);
    return NextResponse.json({ message: 'Error retrieving profile', error: error.message }, { status: 500 });
  }
}
