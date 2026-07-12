import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../../utils/db';
import { NotificationService, OrderNotificationData } from '../../../../../utils/notification';

export async function PATCH(
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
    const { status } = await req.json();

    if (!status) {
      return NextResponse.json({ message: 'Status is required' }, { status: 400 });
    }

    const upperStatus = status.toUpperCase();

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: upperStatus },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Determine notification details
    const notificationItems = order.items.map((i) => ({
      name: `${i.product.name} (${i.color} / ${i.size})`,
      quantity: i.quantity,
      price: i.price,
    }));

    const notificationData: OrderNotificationData = {
      orderNumber: order.orderNumber,
      customerName: 'Valued Client',
      phone: 'Client Phone',
      address: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      items: notificationItems,
      totalAmount: order.subtotal,
      shippingCharge: order.shippingCharge,
      finalAmount: order.finalAmount,
    };

    // Trigger mock status update emails
    if (upperStatus === 'PROCESSING' || upperStatus === 'SHIPPED') {
      const emailHtml = NotificationService.generateEmailTemplate('READY', notificationData);
      NotificationService.saveMockEmail(`order_${order.orderNumber}_ready_status.html`, emailHtml);
    } else if (upperStatus === 'DELIVERED') {
      const emailHtml = NotificationService.generateEmailTemplate('DELIVERED', notificationData);
      NotificationService.saveMockEmail(`order_${order.orderNumber}_delivered_status.html`, emailHtml);
    }

    return NextResponse.json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ message: 'Error updating order status', error: error.message }, { status: 500 });
  }
}
