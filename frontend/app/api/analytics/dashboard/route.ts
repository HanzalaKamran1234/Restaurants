import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '../../../../utils/db';

export async function GET() {
  try {
    const session = await auth();
    const role = (session.sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized. Admin access required' }, { status: 403 });
    }

    // 1. Fetch completed orders for revenue metrics
    const completedOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
    });

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayCompletedOrders = completedOrders.filter(
      (o) => new Date(o.createdAt) >= startOfToday
    );
    const todayRevenue = todayCompletedOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    const monthCompletedOrders = completedOrders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    );
    const monthRevenue = monthCompletedOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    // 2. Fetch order counts by status
    const allOrders = await prisma.order.findMany();
    const totalOrdersCount = allOrders.length;
    const pendingOrdersCount = allOrders.filter((o) => o.status === 'PENDING').length;
    const preparingOrdersCount = allOrders.filter((o) => o.status === 'PREPARING').length;
    const completedOrdersCount = completedOrders.length;
    const cancelledOrdersCount = allOrders.filter((o) => o.status === 'CANCELLED').length;

    // Today total orders
    const todayOrdersCount = allOrders.filter(
      (o) => new Date(o.createdAt) >= startOfToday
    ).length;

    // AOV
    const averageOrderValue = completedOrdersCount > 0 ? parseFloat((totalRevenue / completedOrdersCount).toFixed(2)) : 0;

    // 3. Customers
    const customerCount = await prisma.profile.count();
    
    // Returning customers (profiles with > 1 order)
    const orderGroups = await prisma.order.groupBy({
      by: ['profileId'],
      _count: {
        id: true,
      },
      where: {
        profileId: {
          not: null,
        },
      },
    });
    const returningCustomers = orderGroups.filter((g) => g._count.id > 1).length;

    return NextResponse.json({
      metrics: {
        totalRevenue,
        todayRevenue,
        monthRevenue,
        todayOrdersCount,
        pendingOrdersCount,
        preparingOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        averageOrderValue,
        totalOrdersCount,
        customerCount,
        returningCustomers,
      },
    });
  } catch (error: any) {
    console.error('Error calculating dashboard metrics:', error);
    return NextResponse.json({ message: 'Error calculating metrics', error: error.message }, { status: 500 });
  }
}
