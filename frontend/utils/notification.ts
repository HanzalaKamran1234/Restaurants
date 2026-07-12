import * as fs from 'fs';
import * as path from 'path';

export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  shippingCharge: number;
  finalAmount: number;
  instructions?: string;
}

export class NotificationService {
  private static BUSINESS_WHATSAPP_NUMBER = '923001234567';

  /**
   * Generates a structured WhatsApp text message for order submission
   */
  public static generateWhatsAppMessage(order: OrderNotificationData): string {
    const itemsList = order.items
      .map((item) => `${item.quantity} × ${item.name}`)
      .join('\n');

    const paymentLabel = order.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : order.paymentMethod;

    const msg = `THE VESTRA - NEW ORDER\n\n` +
      `Order ID: ${order.orderNumber}\n\n` +
      `Customer:\n${order.customerName}\n\n` +
      `Contact:\n${order.phone}\n\n` +
      `Shipping Address:\n${order.address}\n\n` +
      `Garments:\n${itemsList}\n\n` +
      `Payment Method:\n${paymentLabel}\n\n` +
      `Total amount:\nRs. ${order.finalAmount}\n\n` +
      `Delivery Instructions:\n${order.instructions || 'None'}`;

    return msg;
  }

  /**
   * Generates a WhatsApp click-to-chat API URL
   */
  public static getWhatsAppApiLink(order: OrderNotificationData): string {
    const encodedText = encodeURIComponent(this.generateWhatsAppMessage(order));
    return `https://api.whatsapp.com/send?phone=${this.BUSINESS_WHATSAPP_NUMBER}&text=${encodedText}`;
  }

  /**
   * Saves mock emails to the disk
   */
  public static saveMockEmail(filename: string, htmlContent: string) {
    try {
      const dir = path.join(process.cwd(), 'temp_emails');
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(path.join(dir, filename), htmlContent, 'utf8');
      console.log(`[MOCK EMAIL] Saved ${filename} successfully.`);
    } catch (err) {
      console.error('Failed to write mock email to disk:', err);
    }
  }

  /**
   * Generates HTML Email templates for customer/admin notifications
   */
  public static generateEmailTemplate(type: 'CONFIRMATION' | 'ADMIN_ALERT' | 'READY' | 'DELIVERED', order: OrderNotificationData): string {
    const itemsRows = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #222; color: #eee; font-size: 13px;">${item.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #222; text-align: center; color: #eee; font-size: 13px;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #222; text-align: right; color: #eee; font-size: 13px;">Rs. ${item.price}</td>
        </tr>
      `
      )
      .join('');

    let subject = '';
    let headline = '';
    let statusText = '';
    let themeColor = '#C8A96A'; // Gold

    switch (type) {
      case 'CONFIRMATION':
        subject = `Order Confirmed - #${order.orderNumber} | THE VESTRA`;
        headline = 'Thank you for your purchase';
        statusText = 'We have registered your order. Our team is conducting a final quality inspection and packaging your garments.';
        break;
      case 'ADMIN_ALERT':
        subject = `🚨 URGENT: New Purchase Order #${order.orderNumber} Received`;
        headline = 'New Purchase Received';
        statusText = 'A customer has placed an order on the portal. Please inspect variants and dispatch via logistics partner.';
        break;
      case 'READY':
        subject = `Your Order #${order.orderNumber} is Packaged and Ready! | THE VESTRA`;
        headline = 'Refined and Packaged';
        statusText = 'Quality inspection is complete. Your package has been handed over to our courier partner for shipping.';
        break;
      case 'DELIVERED':
        subject = `Order #${order.orderNumber} Delivered | THE VESTRA`;
        headline = 'Wear Confidence.';
        statusText = 'Your luxury garments have been successfully delivered. We hope you enjoy the premium quality and fit.';
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0B0B0B; font-family: 'Inter', sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #111111; border: 1px solid #222222; margin-top: 40px; margin-bottom: 40px;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#111111" style="padding: 40px 0 30px 0; border-bottom: 2px solid ${themeColor};">
              <span style="font-size: 24px; font-weight: bold; color: #FFFFFF; letter-spacing: 6px; font-family: 'Cinzel', serif;">THE VESTRA</span>
              <div style="font-size: 10px; color: ${themeColor}; letter-spacing: 4px; margin-top: 8px;">WEAR CONFIDENCE.</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #ffffff; font-size: 20px; font-weight: 600; text-align: center; padding-bottom: 20px; font-family: 'Cinzel', serif; letter-spacing: 1px;">
                    ${headline.toUpperCase()}
                  </td>
                </tr>
                <tr>
                  <td style="color: #B5B5B5; font-size: 13px; line-height: 24px; text-align: center; padding-bottom: 30px; font-weight: 300;">
                    ${statusText}
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #1A1A1A; padding: 20px; border-radius: 4px; border: 1px solid #282828; color: #fff; font-size: 13px; font-weight: 300;">
                      <tr>
                        <td width="50%" style="padding-bottom: 10px;"><strong>Order Reference:</strong></td>
                        <td width="50%" style="text-align: right; padding-bottom: 10px; color: ${themeColor}; font-weight: bold;">#${order.orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;"><strong>Customer Details:</strong></td>
                        <td style="text-align: right; padding-bottom: 10px;">${order.customerName} (${order.phone})</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;"><strong>Shipping Address:</strong></td>
                        <td style="text-align: right; padding-bottom: 10px; color: #ccc;">${order.address}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px;">
                    <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px; font-family: 'Cinzel', serif; font-size: 14px; letter-spacing: 1px;">ORDER ITEMS</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <thead>
                        <tr style="color: ${themeColor}; font-weight: bold; font-size: 12px; letter-spacing: 1px;">
                          <td style="padding: 10px; text-align: left;">Garment</td>
                          <td style="padding: 10px; text-align: center;">Qty</td>
                          <td style="padding: 10px; text-align: right;">Price</td>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsRows}
                      </tbody>
                    </table>
                  </td>
                </tr>
                <!-- Totals -->
                <tr>
                  <td style="padding-top: 20px;">
                    <table align="right" border="0" cellpadding="0" cellspacing="0" width="50%" style="color: #B5B5B5; font-size: 13px;">
                      <tr>
                        <td style="padding: 6px 0;">Subtotal</td>
                        <td style="text-align: right; color: #fff;">Rs. ${order.totalAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0;">Shipping Fee</td>
                        <td style="text-align: right; color: #fff;">${order.shippingCharge === 0 ? 'FREE' : `Rs. ${order.shippingCharge}`}</td>
                      </tr>
                      <tr style="color: ${themeColor}; font-size: 15px; font-weight: bold; border-top: 1px solid #333;">
                        <td style="padding: 12px 0;">Grand Total</td>
                        <td style="text-align: right; padding: 12px 0;">Rs. ${order.finalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td bgcolor="#0B0B0B" style="padding: 40px 30px; text-align: center; border-top: 1px solid #222222;">
              <p style="color: #666; font-size: 11px; margin: 0 0 10px 0; font-weight: 300;">
                You received this email because you made a purchase on the THE VESTRA portal.
              </p>
              <p style="color: ${themeColor}; font-size: 12px; font-weight: bold; margin: 0; letter-spacing: 2px; font-family: 'Cinzel', serif;">
                THE VESTRA - WEAR CONFIDENCE.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
