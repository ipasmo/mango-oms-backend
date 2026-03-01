const transporter = require('../config/email');
const logger = require('../utils/logger');

/**
 * Send email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Mango OMS <noreply@mangooms.com>',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Error sending email to ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Mango OMS!';
  const html = `
    <h1>Welcome ${user.firstName}!</h1>
    <p>Thank you for registering with Mango Order Management System.</p>
    <p>We're excited to have you on board!</p>
    <p>Start exploring our premium mango products and place your first order.</p>
    <br>
    <p>Best regards,</p>
    <p>Mango OMS Team</p>
  `;

  return sendEmail(user.email, subject, html);
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmationEmail = async (user, order) => {
  const subject = `Order Confirmation - ${order.orderNumber}`;
  
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.productName} (${item.lotSize})</td>
        <td>${item.quantity}</td>
        <td>$${item.price.toFixed(2)}</td>
        <td>$${item.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <h1>Order Confirmation</h1>
    <p>Hi ${user.firstName},</p>
    <p>Thank you for your order! Your order has been received and is being processed.</p>
    
    <h2>Order Details</h2>
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
    <p><strong>Status:</strong> ${order.status}</p>
    
    <h3>Items</h3>
    <table border="1" cellpadding="10" style="border-collapse: collapse;">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    
    <h3>Order Summary</h3>
    <p><strong>Subtotal:</strong> $${order.subtotal.toFixed(2)}</p>
    <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
    <p><strong>Shipping:</strong> $${order.shipping.toFixed(2)}</p>
    ${order.discount > 0 ? `<p><strong>Discount:</strong> -$${order.discount.toFixed(2)}</p>` : ''}
    <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
    
    <h3>Shipping Address</h3>
    <p>
      ${order.shippingAddress.fullName}<br>
      ${order.shippingAddress.addressLine1}<br>
      ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
      ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
      ${order.shippingAddress.country}<br>
      Phone: ${order.shippingAddress.phone}
    </p>
    
    <p>We'll send you another email when your order ships.</p>
    
    <br>
    <p>Best regards,</p>
    <p>Mango OMS Team</p>
  `;

  return sendEmail(user.email, subject, html);
};

/**
 * Send order status update email
 */
const sendOrderStatusEmail = async (user, order, oldStatus) => {
  const subject = `Order ${order.orderNumber} - Status Updated`;
  const html = `
    <h1>Order Status Update</h1>
    <p>Hi ${user.firstName},</p>
    <p>Your order status has been updated.</p>
    
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Previous Status:</strong> ${oldStatus}</p>
    <p><strong>New Status:</strong> ${order.status}</p>
    
    ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ''}
    ${order.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${new Date(order.estimatedDelivery).toLocaleDateString()}</p>` : ''}
    
    <p>Thank you for your patience!</p>
    
    <br>
    <p>Best regards,</p>
    <p>Mango OMS Team</p>
  `;

  return sendEmail(user.email, subject, html);
};

/**
 * Send order cancellation email
 */
const sendOrderCancellationEmail = async (user, order) => {
  const subject = `Order ${order.orderNumber} - Cancelled`;
  const html = `
    <h1>Order Cancelled</h1>
    <p>Hi ${user.firstName},</p>
    <p>Your order has been cancelled as requested.</p>
    
    <p><strong>Order Number:</strong> ${order.orderNumber}</p>
    <p><strong>Cancellation Date:</strong> ${new Date(order.cancelledAt).toLocaleDateString()}</p>
    ${order.cancellationReason ? `<p><strong>Reason:</strong> ${order.cancellationReason}</p>` : ''}
    
    <p>If you have any questions, please contact our support team.</p>
    
    <br>
    <p>Best regards,</p>
    <p>Mango OMS Team</p>
  `;

  return sendEmail(user.email, subject, html);
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Password Reset Request';
  const html = `
    <h1>Password Reset</h1>
    <p>Hi ${user.firstName},</p>
    <p>You requested to reset your password. Click the link below to reset it:</p>
    
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    
    <br>
    <p>Best regards,</p>
    <p>Mango OMS Team</p>
  `;

  return sendEmail(user.email, subject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail,
  sendOrderCancellationEmail,
  sendPasswordResetEmail,
};
