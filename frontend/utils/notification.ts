import * as fs from 'fs';
import * as path from 'path';

export interface OrderNotificationData {
  orderNumber: string;
  customerName: string;
  phone: string;
  whatsapp?: string;
  address: string;
  area: string;
  landmark?: string;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  deliveryCharge: number;
  tax: number;
  finalAmount: number;
  instructions?: string;
}

export class NotificationService {
  private static BUSINESS_WHATSAPP_NUMBER = '923001234567'; // Default Ziyafat Biz Number

  /**
   * Generates a structured WhatsApp text message for order submission
   */
  public static generateWhatsAppMessage(order: OrderNotificationData): string {
    const itemsList = order.items
      .map((item) => `${item.quantity} × ${item.name}`)
      .join('\n');

    const paymentLabel = 'Cash on Delivery';

    const msg = `NEW ORDER\n\n` +
      `Order ID: ${order.orderNumber}\n\n` +
      `Customer:\n${order.customerName}\n\n` +
      `Phone:\n${order.phone}\n\n` +
      `Address:\n${order.address}, ${order.area}${order.landmark ? ` (Landmark: ${order.landmark})` : ''}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Payment:\n${paymentLabel}\n\n` +
      `Total:\nRs. ${order.finalAmount}\n\n` +
      `Customer Notes:\n${order.instructions || 'None'}`;

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
   * Saves mock emails to the disk (to verify output layout in local dev)
   */
  public static saveMockEmail(filename: string, htmlContent: string) {
    try {
      // In Next.js, we write emails under project_root/temp_emails
      // The current working directory is typically the project root
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
          <td style="padding: 10px; border-bottom: 1px solid #222; color: #eee;">${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #222; text-align: center; color: #eee;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #222; text-align: right; color: #eee;">Rs. ${item.price}</td>
        </tr>
      `
      )
      .join('');

    let subject = '';
    let headline = '';
    let statusText = '';
    let themeColor = '#c41e3a'; // Deep Red

    switch (type) {
      case 'CONFIRMATION':
        subject = `Order Confirmed - #${order.orderNumber} | Ziyafat`;
        headline = 'Thank you for your order!';
        statusText = 'We have received your order and the kitchen is getting ready to prepare your feast.';
        break;
      case 'ADMIN_ALERT':
        subject = `🚨 URGENT: New Order #${order.orderNumber} Received`;
        headline = 'New Order Received';
        statusText = 'A customer has placed an order. Please review and send to kitchen preparation immediately.';
        themeColor = '#d4af37'; // Gold
        break;
      case 'READY':
        subject = `Your Order #${order.orderNumber} is Ready! | Ziyafat`;
        headline = 'Prepared to Perfection';
        statusText = 'Our chefs have finalized your order. A delivery rider is picking it up now.';
        break;
      case 'DELIVERED':
        subject = `Order #${order.orderNumber} Delivered | Ziyafat`;
        headline = 'Enjoy Your Feast!';
        statusText = 'Your meal has been successfully delivered. We hope you love the luxury dining experience.';
        break;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #070707; font-family: 'Poppins', sans-serif;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #0d0d0d; border: 1px solid #1a1a1a; margin-top: 40px; margin-bottom: 40px;">
          <!-- Header -->
          <tr>
            <td align="center" bgcolor="#0d0d0d" style="padding: 30px 0 20px 0; border-bottom: 3px solid ${themeColor};">
              <span style="font-size: 28px; font-weight: bold; color: #c41e3a; letter-spacing: 2px;">ضیافت</span>
              <div style="font-size: 14px; color: #d4af37; letter-spacing: 4px; margin-top: 5px;">ZIYAFAT</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px 40px 30px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="color: #ffffff; font-size: 22px; font-weight: 600; text-align: center; padding-bottom: 20px;">
                    ${headline}
                  </td>
                </tr>
                <tr>
                  <td style="color: #aaa; font-size: 15px; line-height: 24px; text-align: center; padding-bottom: 30px;">
                    ${statusText}
                  </td>
                </tr>
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #111; padding: 20px; border-radius: 8px; border: 1px solid #222; color: #fff;">
                      <tr>
                        <td width="50%" style="padding-bottom: 10px;"><strong>Order Number:</strong></td>
                        <td width="50%" style="text-align: right; padding-bottom: 10px; color: #c41e3a;">#${order.orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;"><strong>Customer Details:</strong></td>
                        <td style="text-align: right; padding-bottom: 10px;">${order.customerName} (${order.phone})</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;"><strong>Area:</strong></td>
                        <td style="text-align: right; padding-bottom: 10px;">${order.area}</td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 10px;"><strong>Address:</strong></td>
                        <td style="text-align: right; padding-bottom: 10px; color: #ccc;">${order.address}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 30px;">
                    <h3 style="color: #fff; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px;">Order Summary</h3>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <thead>
                        <tr style="color: #d4af37; font-weight: bold;">
                          <td style="padding: 10px; text-align: left;">Item</td>
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
                    <table align="right" border="0" cellpadding="0" cellspacing="0" width="50%" style="color: #eee; font-size: 14px;">
                      <tr>
                        <td style="padding: 5px 0;">Subtotal</td>
                        <td style="text-align: right;">Rs. ${order.totalAmount}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;">Delivery Charge</td>
                        <td style="text-align: right;">Rs. ${order.deliveryCharge}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0;">GST / Tax (13%)</td>
                        <td style="text-align: right;">Rs. ${order.tax}</td>
                      </tr>
                      <tr style="color: #c41e3a; font-size: 16px; font-weight: bold; border-top: 1px solid #333;">
                        <td style="padding: 10px 0;">Grand Total</td>
                        <td style="text-align: right; padding: 10px 0;">Rs. ${order.finalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td bgcolor="#070707" style="padding: 30px 30px 30px 30px; text-align: center; border-top: 1px solid #1a1a1a;">
              <p style="color: #555; font-size: 12px; margin: 0 0 10px 0;">
                You received this email because you ordered from Ziyafat.
              </p>
              <p style="color: #d4af37; font-size: 13px; font-weight: bold; margin: 0;">
                ضیافت - Traditional Premium Dining
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
}
