import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotificationService } from '../services/notificationService';
import * as fs from 'fs';
import * as path from 'path';

// Helper to write mock email html files to disk
const saveMockEmail = (filename: string, htmlContent: string) => {
  try {
    const dir = path.join(__dirname, '../../temp_emails');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path.join(dir, filename), htmlContent, 'utf8');
    console.log(`[MOCK EMAIL] Created ${filename}`);
  } catch (err) {
    console.error('Failed to write mock email', err);
  }
};

export const createOrder = async (req: AuthRequest, res: Response) => {
  const {
    items, // Array of { menuItemId, quantity }
    deliveryAddress,
    nearestLandmark,
    area,
    instructions,
    couponCode,
    paymentMethod, // "COD", "JAZZCASH", "EASYPAISA", "CARD"
    customerName,
    customerPhone,
  } = req.body;

  if (!items || items.length === 0 || !deliveryAddress || !area || !customerName || !customerPhone) {
    return res.status(400).json({ message: 'Missing required checkout information' });
  }

  try {
    // 1. Calculate values
    let totalAmount = 0;
    const orderItemsData = [];
    const notificationItems = [];

    for (const item of items) {
      const dbItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!dbItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      const itemPriceAfterDiscount = dbItem.price * (1 - dbItem.discount / 100);
      totalAmount += itemPriceAfterDiscount * item.quantity;

      orderItemsData.push({
        menuItemId: dbItem.id,
        quantity: item.quantity,
        price: itemPriceAfterDiscount,
      });

      notificationItems.push({
        name: dbItem.name,
        quantity: item.quantity,
        price: itemPriceAfterDiscount,
      });
    }

    // Apply Coupon if valid
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.active && new Date() < coupon.expiresAt) {
        discountAmount = totalAmount * (coupon.discountPercent / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        totalAmount = Math.max(0, totalAmount - discountAmount);
      }
    }

    const deliveryCharge = 150; // Default Rs. 150 for Karachi
    const taxRate = 0.13; // 13% GST
    const tax = parseFloat((totalAmount * taxRate).toFixed(2));
    const finalAmount = parseFloat((totalAmount + deliveryCharge + tax).toFixed(2));

    const orderNumber = `ZY-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user ? req.user.id : null,
        status: 'PENDING',
        totalAmount,
        deliveryCharge,
        tax,
        finalAmount,
        paymentMethod,
        deliveryAddress,
        nearestLandmark,
        area,
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

    // 2. Add Loyalty points (Rs. 100 spent = 1 point)
    if (req.user) {
      const pointsEarned = Math.floor(finalAmount / 100);
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          loyaltyPoints: {
            increment: pointsEarned,
          },
        },
      });
    }

    // 3. Trigger Mock Notifications
    const notificationData = {
      orderNumber,
      customerName,
      phone: customerPhone,
      address: deliveryAddress,
      area,
      landmark: nearestLandmark,
      paymentMethod,
      items: notificationItems,
      totalAmount,
      deliveryCharge,
      tax,
      finalAmount,
      instructions,
    };

    // Generate WhatsApp click to chat link
    const whatsappLink = NotificationService.getWhatsAppApiLink(notificationData);

    // Save Mock Emails
    const customerEmailHtml = NotificationService.generateEmailTemplate('CONFIRMATION', notificationData);
    const adminEmailHtml = NotificationService.generateEmailTemplate('ADMIN_ALERT', notificationData);

    saveMockEmail(`order_${orderNumber}_customer_confirm.html`, customerEmailHtml);
    saveMockEmail(`order_${orderNumber}_admin_alert.html`, adminEmailHtml);

    return res.status(201).json({
      message: 'Order created successfully',
      order,
      whatsappLink,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error placing order', error: error.message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving order', error: error.message });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // PENDING, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: { menuItem: true },
        },
      },
    });

    // Send status update notification email mock
    const notificationData = {
      orderNumber: order.orderNumber,
      customerName: order.userId ? 'Valued Customer' : 'Customer',
      phone: 'Customer Phone',
      address: order.deliveryAddress,
      area: order.area,
      landmark: order.nearestLandmark || undefined,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: order.totalAmount,
      deliveryCharge: order.deliveryCharge,
      tax: order.tax,
      finalAmount: order.finalAmount,
    };

    if (status === 'PREPARING') {
      const emailHtml = NotificationService.generateEmailTemplate('READY', notificationData);
      saveMockEmail(`order_${order.orderNumber}_ready_status.html`, emailHtml);
    } else if (status === 'DELIVERED') {
      const emailHtml = NotificationService.generateEmailTemplate('DELIVERED', notificationData);
      saveMockEmail(`order_${order.orderNumber}_delivered_status.html`, emailHtml);
    }

    return res.json({ message: 'Order status updated successfully', order });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};

export const getAdminOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { menuItem: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching admin orders', error: error.message });
  }
};
