import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        collection: true,
        images: true,
        variants: true,
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

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching product by id:', error);
    return NextResponse.json({ message: 'Error retrieving product', error: error.message }, { status: 500 });
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
    if (data.available !== undefined) data.available = Boolean(data.available);

    // If variants or images are passed in PUT, we can update them inside a transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Pull out relations from direct data update to prevent prisma write errors
      const { variants, images, category, collection, ...directFields } = data;

      const prod = await tx.product.update({
        where: { id },
        data: directFields,
      });

      // Update variants if provided
      if (Array.isArray(variants)) {
        // Simple strategy: recreate variants to avoid complex matching
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const variant of variants) {
          if (variant.color && variant.size) {
            await tx.productVariant.create({
              data: {
                productId: id,
                color: variant.color,
                size: variant.size,
                inventory: parseInt(variant.inventory) || 0,
                sku: `${prod.name.substring(0, 3).toUpperCase()}-${variant.color.substring(0, 2).toUpperCase()}-${variant.size}-${prod.id.substring(0, 4).toUpperCase()}`
              }
            });
          }
        }
      }

      // Update images if provided
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        for (const img of images) {
          if (img.url) {
            await tx.productImage.create({
              data: {
                url: img.url,
                productId: id
              }
            });
          }
        }
      }

      return prod;
    });

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ message: 'Error updating product', error: error.message }, { status: 500 });
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

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ message: 'Error deleting product', error: error.message }, { status: 500 });
  }
}
