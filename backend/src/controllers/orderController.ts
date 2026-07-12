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
    items, // Array of { productId, quantity, color, size }
    shippingAddress,
    notes,
    paymentMethod, // "COD", "CARD", "JAZZCASH", "EASYPAISA"
    customerName,
    customerPhone,
    addressId
  } = req.body;

  if (!items || items.length === 0 || !shippingAddress || !customerName || !customerPhone) {
    return res.status(400).json({ message: 'Missing required checkout information' });
  }

  try {
    let subtotal = 0;
    const orderItemsData: any[] = [];
    const notificationItems: any[] = [];

    // Run verification and inventory decrement inside a transaction
    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const dbProduct = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true }
        });

        if (!dbProduct) {
          throw new Error(`Product not found`);
        }

        if (!dbProduct.available) {
          throw new Error(`Product '${dbProduct.name}' is currently unavailable.`);
        }

        // Find matching variant
        const matchedVariant = dbProduct.variants.find(
          v => v.color.toLowerCase() === item.color.toLowerCase() && v.size.toLowerCase() === item.size.toLowerCase()
        );

        if (!matchedVariant) {
          throw new Error(`Variant color/size not found for ${dbProduct.name}`);
        }

        if (matchedVariant.inventory < item.quantity) {
          throw new Error(`Insufficient stock for ${dbProduct.name} (${item.color}/${item.size}). Available: ${matchedVariant.inventory}`);
        }

        const priceAfterDiscount = dbProduct.price * (1 - dbProduct.discount / 100);
        subtotal += priceAfterDiscount * item.quantity;

        // Decrement stock
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

      // Calculations
      const shippingCharge = subtotal >= 5000 ? 0 : 200;
      const finalAmount = subtotal + shippingCharge;

      // Generate order number
      const count = await tx.order.count();
      const orderNumber = `VST-${String(count + 1).padStart(6, '0')}`;

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          profileId: req.user ? req.user.id : null,
          status: 'PENDING',
          subtotal,
          shippingCharge,
          tax: 0,
          finalAmount,
          paymentMethod,
          shippingAddress,
          addressId: addressId || null,
          notes,
          items: {
            create: orderItemsData
          }
        },
        include: {
          items: {
            include: {
              product: { include: { images: true } },
              variant: true
            }
          }
        }
      });

      // Update loyalty points
      if (req.user) {
        const points = Math.floor(subtotal / 100);
        if (points > 0) {
          await tx.profile.update({
            where: { id: req.user.id },
            data: {
              loyaltyPoints: {
                increment: points
              }
            }
          });
        }
      }

      return newOrder;
    });

    const shippingChargeVal = subtotal >= 5000 ? 0 : 200;
    const finalAmountVal = subtotal + shippingChargeVal;

    // Trigger mock notification logs
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
      instructions: notes || undefined
    };

    const whatsappLink = NotificationService.getWhatsAppApiLink(notificationData);
    const customerEmailHtml = NotificationService.generateEmailTemplate('CONFIRMATION', notificationData);
    const adminEmailHtml = NotificationService.generateEmailTemplate('ADMIN_ALERT', notificationData);

    saveMockEmail(`order_${order.orderNumber}_customer_confirm.html`, customerEmailHtml);
    saveMockEmail(`order_${order.orderNumber}_admin_alert.html`, adminEmailHtml);

    return res.status(201).json({
      message: 'Purchase completed successfully',
      order,
      whatsappLink
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message || 'Error placing order' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true
          },
        }
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
      where: { profileId: req.user.id },
      include: {
        items: {
          include: {
            product: { include: { images: true } },
            variant: true
          },
        }
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
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() },
      include: {
        items: {
          include: { product: true }
        }
      },
    });

    const notificationData = {
      orderNumber: order.orderNumber,
      customerName: 'Valued Client',
      phone: 'Client Phone',
      address: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      items: order.items.map((i) => ({
        name: `${i.product.name} (${i.color} / ${i.size})`,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: order.subtotal,
      shippingCharge: order.shippingCharge,
      finalAmount: order.finalAmount,
    };

    const statusUpper = status.toUpperCase();
    if (statusUpper === 'PROCESSING' || statusUpper === 'SHIPPED') {
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
          include: {
            product: { include: { images: true } },
            variant: true
          },
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching admin orders', error: error.message });
  }
};
