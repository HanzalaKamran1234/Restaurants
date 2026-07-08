import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Core stats
    const totalOrdersCount = await prisma.order.count();
    const pendingOrdersCount = await prisma.order.count({ where: { status: 'PENDING' } });
    const completedOrdersCount = await prisma.order.count({ where: { status: 'DELIVERED' } });
    const cancelledOrdersCount = await prisma.order.count({ where: { status: 'CANCELLED' } });

    // Aggregate revenues
    const allCompletedOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: { finalAmount: true },
    });
    const totalRevenue = allCompletedOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await prisma.order.findMany({
      where: { createdAt: { gte: today } },
      select: { finalAmount: true },
    });
    const todayOrdersCount = todayOrders.length;
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.finalAmount, 0);

    const averageOrderValue = completedOrdersCount > 0 ? parseFloat((totalRevenue / completedOrdersCount).toFixed(2)) : 0;

    // 2. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    // 3. Popular items (Count occurrences in OrderItems)
    const orderItems = await prisma.orderItem.findMany({
      include: { menuItem: true },
    });

    const itemCounts: { [key: string]: { name: string; quantity: number; image: string } } = {};
    for (const oi of orderItems) {
      if (oi.menuItem) {
        if (!itemCounts[oi.menuItemId]) {
          itemCounts[oi.menuItemId] = {
            name: oi.menuItem.name,
            quantity: 0,
            image: oi.menuItem.image,
          };
        }
        itemCounts[oi.menuItemId].quantity += oi.quantity;
      }
    }

    const popularItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    // 4. Daily Revenue Trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const dayOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: d,
            lte: dEnd,
          },
          status: 'DELIVERED',
        },
        select: { finalAmount: true },
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.finalAmount, 0);
      revenueTrend.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
      });
    }

    return res.json({
      metrics: {
        totalRevenue,
        todayRevenue,
        todayOrdersCount,
        pendingOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        averageOrderValue,
        totalOrdersCount,
      },
      recentOrders,
      popularItems,
      revenueTrend,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving analytics', error: error.message });
  }
};
