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
          include: { menuItem: true },
        },
        area: true,
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
          include: { menuItem: true },
        },
        area: true,
      },
    });

    // Determine notification data
    const notificationItems = order.items.map((i) => ({
      name: `${i.menuItem.name} (${i.size})`,
      quantity: i.quantity,
      price: i.price,
    }));

    const notificationData: OrderNotificationData = {
      orderNumber: order.orderNumber,
      customerName: 'Valued Customer',
      phone: 'Customer Phone',
      address: order.deliveryAddress,
      area: order.area ? order.area.name : 'Delivery Area',
      paymentMethod: order.paymentMethod,
      items: notificationItems,
      totalAmount: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      tax: order.tax,
      finalAmount: order.finalAmount,
    };

    // Trigger mock status update emails
    if (upperStatus === 'PREPARING') {
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
