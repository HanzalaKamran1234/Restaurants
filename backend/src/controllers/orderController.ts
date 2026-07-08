import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotificationService, OrderNotificationData } from '../services/notificationService';
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
    areaId,
    instructions,
    paymentMethod, // "COD", "JAZZCASH", "CARD"
    customerName,
    customerPhone,
    whatsappNumber
  } = req.body;

  if (!items || items.length === 0 || !deliveryAddress || !areaId || !customerName || !customerPhone) {
    return res.status(400).json({ message: 'Missing required checkout information' });
  }

  try {
    // 1. Verify Delivery Area
    const deliveryArea = await prisma.deliveryArea.findUnique({ where: { id: areaId } });
    if (!deliveryArea) {
      return res.status(404).json({ message: 'Selected delivery area not found' });
    }

    if (!deliveryArea.available) {
      return res.status(400).json({ message: `Delivery to ${deliveryArea.name} is currently closed.` });
    }

    // 2. Calculate values
    let subtotal = 0;
    const orderItemsData = [];
    const notificationItems = [];

    for (const item of items) {
      const dbItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
      if (!dbItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found` });
      }

      if (!dbItem.available) {
        return res.status(400).json({ message: `Dish '${dbItem.name}' is currently sold out.` });
      }

      const itemPriceAfterDiscount = dbItem.price * (1 - dbItem.discount / 100);
      subtotal += itemPriceAfterDiscount * item.quantity;

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

    // Check Minimum Order Amount
    if (subtotal < deliveryArea.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount of Rs. ${deliveryArea.minOrderAmount} is required for ${deliveryArea.name}. Your current total is Rs. ${subtotal}.`
      });
    }

    const deliveryCharge = deliveryArea.deliveryCharge;
    const taxRate = 0.13; // 13% GST
    const tax = parseFloat((subtotal * taxRate).toFixed(2));
    const finalAmount = parseFloat((subtotal + deliveryCharge + tax).toFixed(2));

    // Generate ZYF-XXXXXX sequential order number
    const count = await prisma.order.count();
    const orderNumber = `ZYF-${String(count + 1).padStart(6, '0')}`;

    // Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: req.user ? req.user.id : null,
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

    // 3. Trigger Mock Notifications
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

    // Generate WhatsApp click to chat link
    const whatsappLink = NotificationService.getWhatsAppApiLink(notificationData);

    // Save Mock Emails (Confirmations)
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
        area: true
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
        area: true
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
  const { status } = req.body; // PENDING, ACCEPTED, PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: {
        items: {
          include: { menuItem: true },
        },
        area: true
      },
    });

    // Send status update notification email mock
    const notificationData = {
      orderNumber: order.orderNumber,
      customerName: order.userId ? 'Valued Customer' : 'Customer',
      phone: 'Customer Phone',
      address: order.deliveryAddress,
      area: order.area ? order.area.name : 'Delivery Area',
      landmark: order.nearestLandmark || undefined,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i) => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: order.subtotal,
      deliveryCharge: order.deliveryCharge,
      tax: order.tax,
      finalAmount: order.finalAmount,
    };

    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PREPARING') {
      const emailHtml = NotificationService.generateEmailTemplate('READY', notificationData);
      saveMockEmail(`order_${order.orderNumber}_ready_status.html`, emailHtml);
    } else if (statusUpper === 'DELIVERED') {
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
        area: true
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching admin orders', error: error.message });
  }
};
