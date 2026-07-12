import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../utils/db';
import { NotificationService, OrderNotificationData } from '../../../utils/notification';

export async function GET() {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
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
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ message: 'Error retrieving orders', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // null if guest checkout
    const body = await req.json();

    const {
      items, // Array of { productId, quantity, size, color }
      shippingAddress,
      notes,
      paymentMethod, // "COD", "CARD", "JAZZCASH", "EASYPAISA"
      customerName,
      customerPhone,
      addressId,
    } = body;

    if (!items || items.length === 0 || !shippingAddress || !customerName || !customerPhone) {
      return NextResponse.json({ message: 'Missing required shipping or items information' }, { status: 400 });
    }

    // 1. Process items and verify stock availability
    let subtotal = 0;
    const orderItemsData: any[] = [];
    const notificationItems: any[] = [];

    // We run the stock check and total calculation inside a transaction to prevent race conditions
    const order = await prisma.$transaction(async (tx) => {
      
      for (const item of items) {
        const dbProduct = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true, images: true }
        });

        if (!dbProduct) {
          throw new Error(`Product not found`);
        }

        if (!dbProduct.available) {
          throw new Error(`Product '${dbProduct.name}' is currently unavailable.`);
        }

        // Find the variant matching color & size
        const matchedVariant = dbProduct.variants.find(
          v => v.color.toLowerCase() === item.color.toLowerCase() && v.size.toLowerCase() === item.size.toLowerCase()
        );

        if (!matchedVariant) {
          throw new Error(`Size/Color variant (${item.color} / ${item.size}) not found for ${dbProduct.name}`);
        }

        if (matchedVariant.inventory < item.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct.name} (${item.color}/${item.size}). Available: ${matchedVariant.inventory}`);
        }

        const priceAfterDiscount = dbProduct.price * (1 - dbProduct.discount / 100);
        subtotal += priceAfterDiscount * item.quantity;

        // Decrement variant inventory
        await tx.productVariant.update({
          where: { id: matchedVariant.id },
          data: {
            inventory: {
              decrement: item.quantity
            }
          }
        });

        orderItemsData.push({
          productId: dbProduct.id,
          variantId: matchedVariant.id,
          quantity: item.quantity,
          price: priceAfterDiscount,
          color: item.color,
          size: item.size
        });

        notificationItems.push({
          name: `${dbProduct.name} (${item.color} / ${item.size})`,
          quantity: item.quantity,
          price: priceAfterDiscount
        });
      }

      // Calculate shipping
      const shippingCharge = subtotal >= 5000 ? 0 : 200;
      const finalAmount = subtotal + shippingCharge;

      // Generate sequential order numbers: VST-000001
      const count = await tx.order.count();
      const orderNumber = `VST-${String(count + 1).padStart(6, '0')}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          profileId: userId || null,
          status: 'PENDING',
          subtotal,
          shippingCharge,
          tax: 0, // Tax inclusive
          finalAmount,
          paymentMethod,
          shippingAddress,
          addressId: addressId || null,
          notes,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: true
            },
          },
        },
      });

      // Update customer loyalty points (1 point per 100 Rs spent)
      if (userId) {
        const pointsEarned = Math.floor(subtotal / 100);
        if (pointsEarned > 0) {
          await tx.profile.update({
            where: { id: userId },
            data: {
              loyaltyPoints: {
                increment: pointsEarned,
              },
            },
          });
        }
      }

      return newOrder;
    });

    // 2. Trigger notifications
    const shippingChargeVal = subtotal >= 5000 ? 0 : 200;
    const finalAmountVal = subtotal + shippingChargeVal;
    
    const notificationData: OrderNotificationData = {
      orderNumber: order.orderNumber,
      customerName,
      phone: customerPhone,
      address: shippingAddress,
      paymentMethod,
      items: notificationItems,
      totalAmount: subtotal,
      shippingCharge: shippingChargeVal,
      finalAmount: finalAmountVal,
      instructions: notes || undefined,
    };

    const whatsappLink = NotificationService.getWhatsAppApiLink(notificationData);

    // Save Mock Emails (Confirmations)
    const customerEmailHtml = NotificationService.generateEmailTemplate('CONFIRMATION', notificationData);
    const adminEmailHtml = NotificationService.generateEmailTemplate('ADMIN_ALERT', notificationData);

    NotificationService.saveMockEmail(`order_${order.orderNumber}_customer_confirm.html`, customerEmailHtml);
    NotificationService.saveMockEmail(`order_${order.orderNumber}_admin_alert.html`, adminEmailHtml);

    return NextResponse.json({
      message: 'Purchase completed successfully',
      order,
      whatsappLink,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ message: error.message || 'Error placing order' }, { status: 500 });
  }
}
