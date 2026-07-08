import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Core Order Counts
    const totalOrdersCount = await prisma.order.count();
    const pendingOrdersCount = await prisma.order.count({ where: { status: 'PENDING' } });
    const preparingOrdersCount = await prisma.order.count({ where: { status: 'PREPARING' } });
    const completedOrdersCount = await prisma.order.count({ where: { status: 'DELIVERED' } });
    const cancelledOrdersCount = await prisma.order.count({ where: { status: 'CANCELLED' } });

    // Dates
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 2. Revenue calculations (Only completed orders count towards revenue)
    const allCompletedOrders = await prisma.order.findMany({
      where: { status: 'DELIVERED' },
      select: { finalAmount: true, createdAt: true },
    });

    const totalRevenue = allCompletedOrders.reduce((sum, o) => sum + o.finalAmount, 0);
    
    const todayRevenue = allCompletedOrders
      .filter(o => o.createdAt >= startOfToday)
      .reduce((sum, o) => sum + o.finalAmount, 0);

    const monthRevenue = allCompletedOrders
      .filter(o => o.createdAt >= startOfMonth)
      .reduce((sum, o) => sum + o.finalAmount, 0);

    const todayOrdersCount = await prisma.order.count({
      where: { createdAt: { gte: startOfToday } }
    });

    // 3. Customer analysis
    const customerCount = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    // Returning Customers (Users with > 1 order)
    const userOrderCounts = await prisma.order.groupBy({
      by: ['userId'],
      _count: {
        id: true,
      },
      where: {
        userId: { not: null },
      },
    });
    const returningCustomers = userOrderCounts.filter(u => u._count.id > 1).length;

    const averageOrderValue = completedOrdersCount > 0 ? parseFloat((totalRevenue / completedOrdersCount).toFixed(2)) : 0;

    // 4. Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { menuItem: true },
        },
        area: true
      },
    });

    // 5. Best selling items
    const orderItems = await prisma.orderItem.findMany({
      include: { menuItem: true },
    });

    const itemCounts: { [key: string]: { name: string; quantity: number; image: string; price: number } } = {};
    for (const oi of orderItems) {
      if (oi.menuItem) {
        if (!itemCounts[oi.menuItemId]) {
          itemCounts[oi.menuItemId] = {
            name: oi.menuItem.name,
            quantity: 0,
            image: oi.menuItem.image,
            price: oi.price
          };
        }
        itemCounts[oi.menuItemId].quantity += oi.quantity;
      }
    }

    const bestSellingItems = Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 4);

    // 6. Daily Revenue Trend (last 7 days)
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
        monthRevenue,
        todayOrdersCount,
        pendingOrdersCount,
        preparingOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        averageOrderValue,
        totalOrdersCount,
        customerCount,
        returningCustomers
      },
      recentOrders,
      bestSellingItems,
      revenueTrend,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving analytics', error: error.message });
  }
};
