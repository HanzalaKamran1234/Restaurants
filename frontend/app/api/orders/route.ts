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
          include: { menuItem: true },
        },
        area: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format fields for frontend compatibility (e.g. rename subtotal to subtotal, finalAmount to finalAmount)
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ message: 'Error retrieving orders', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth(); // null if not logged in (guest order)
    const body = await req.json();

    const {
      items, // Array of { menuItemId, quantity, size }
      deliveryAddress,
      nearestLandmark,
      areaId,
      instructions,
      paymentMethod, // "COD", "JAZZCASH", "CARD"
      customerName,
      customerPhone,
      whatsappNumber,
    } = body;

    if (!items || items.length === 0 || !deliveryAddress || !areaId || !customerName || !customerPhone) {
      return NextResponse.json({ message: 'Missing required checkout information' }, { status: 400 });
    }

    // 1. Verify Delivery Area
    const deliveryArea = await prisma.deliveryArea.findUnique({ where: { id: areaId } });
    if (!deliveryArea) {
      return NextResponse.json({ message: 'Selected delivery area not found' }, { status: 404 });
    }

    if (!deliveryArea.available) {
      return NextResponse.json({ message: `Delivery to ${deliveryArea.name} is currently closed.` }, { status: 400 });
    }

    // 2. Calculate totals and validate items
    let subtotal = 0;
    const orderItemsData = [];
    const notificationItems = [];

    for (const item of items) {
      const dbItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!dbItem) {
        return NextResponse.json({ message: `Menu item not found` }, { status: 404 });
      }

      if (!dbItem.available) {
        return NextResponse.json({ message: `Dish '${dbItem.name}' is currently sold out.` }, { status: 400 });
      }

      // Dynamic price matching based on selected size
      let itemPrice = dbItem.price;
      const selectedSize = item.size || 'Regular';
      if (dbItem.sizes) {
        try {
          const sizesList = JSON.parse(dbItem.sizes);
          const matchedSize = sizesList.find((s: any) => s.size === selectedSize);
          if (matchedSize) {
            itemPrice = matchedSize.price;
          }
        } catch (e) {
          console.error('Error parsing sizes JSON on item', dbItem.name, e);
        }
      }

      const itemPriceAfterDiscount = itemPrice * (1 - dbItem.discount / 100);
      subtotal += itemPriceAfterDiscount * item.quantity;

      orderItemsData.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: itemPriceAfterDiscount,
        size: selectedSize,
      });

      notificationItems.push({
        name: `${dbItem.name} (${selectedSize})`,
        quantity: item.quantity,
        price: itemPriceAfterDiscount,
      });
    }

    // Verify minimum order amount constraint
    if (subtotal < deliveryArea.minOrderAmount) {
      return NextResponse.json({
        message: `Minimum order amount of Rs. ${deliveryArea.minOrderAmount} is required for ${deliveryArea.name}. Your total is Rs. ${subtotal}.`
      }, { status: 400 });
    }

    const deliveryCharge = deliveryArea.deliveryCharge;
    const taxRate = 0.13; // 13% GST
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const finalAmount = parseFloat((subtotal + deliveryCharge + tax).toFixed(2));

    // Generate sequential ZYF-000001 order numbers
    const count = await prisma.order.count();
    const orderNumber = `ZYF-${String(count + 1).padStart(6, '0')}`;

    // Place the order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        profileId: userId || null,
        status: 'PENDING',
        subtotal,
        deliveryCharge,
        tax,
        finalAmount,
        paymentMethod,
        deliveryAddress,
        nearestLandmark,
        areaId: deliveryArea.id,
        instructions,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    // 3. Loyalty points addition (only for registered profiles)
    if (userId) {
      const pointsEarned = Math.floor(subtotal / 100); // 1 point per 100 Rs spent
      if (pointsEarned > 0) {
        await prisma.profile.update({
          where: { id: userId },
          data: {
            loyaltyPoints: {
              increment: pointsEarned,
            },
          },
        });
      }
    }

    // 4. Trigger Email and WhatsApp click-to-chat payload
    const notificationData: OrderNotificationData = {
      orderNumber,
      customerName,
      phone: customerPhone,
      whatsapp: whatsappNumber || undefined,
      address: deliveryAddress,
      area: deliveryArea.name,
      landmark: nearestLandmark || undefined,
      paymentMethod,
      items: notificationItems,
      totalAmount: subtotal,
      deliveryCharge,
      tax,
      finalAmount,
      instructions,
    };

    const whatsappLink = NotificationService.getWhatsAppApiLink(notificationData);

    // Save Mock Emails (Confirmations)
    const customerEmailHtml = NotificationService.generateEmailTemplate('CONFIRMATION', notificationData);
    const adminEmailHtml = NotificationService.generateEmailTemplate('ADMIN_ALERT', notificationData);

    NotificationService.saveMockEmail(`order_${orderNumber}_customer_confirm.html`, customerEmailHtml);
    NotificationService.saveMockEmail(`order_${orderNumber}_admin_alert.html`, adminEmailHtml);

    return NextResponse.json({
      message: 'Order created successfully',
      order,
      whatsappLink,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ message: 'Error placing order', error: error.message }, { status: 500 });
  }
}
