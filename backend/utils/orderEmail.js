const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  return transporter;
};

const formatMoney = (currencyCode, amount) => {
  const numericAmount = Number(amount || 0);
  return `${currencyCode || ''} ${numericAmount.toFixed(2)}`.trim();
};

const getAdminMailbox = () =>
  String(process.env.ADMIN_EMAIL || process.env.EMAIL_USER || '').trim();

const formatAddressLine = (address = {}) => {
  if (!address) return 'Address not available';

  const name = [address.first_name, address.last_name].filter(Boolean).join(' ').trim();
  const line = [
    name,
    address.company_name,
    address.address_line1,
    address.address_line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(' ').trim(),
    address.country_name || address.country,
    address.phone,
    address.email,
  ]
    .filter(Boolean)
    .join(', ');

  return line || 'Address not available';
};

const getMailTypeLabel = (mailType) => {
  switch (mailType) {
    case 'confirmed':
      return 'order-confirmed-admin';
    case 'paid':
      return 'payment-confirmed-user';
    case 'shipped':
      return 'shipped-user';
    case 'delivered':
      return 'delivered-user';
    default:
      return mailType || 'unknown';
  }
};

const sendOrderEmail = async ({ customer, order, items, address, mailType }) => {
  const mailer = getTransporter();

  if (!mailer) {
    return { skipped: true, reason: 'Missing SMTP config' };
  }

  const customerEmail = String(customer?.email || '').trim();
  const customerName = String(customer?.name || 'Customer').trim();
  const adminSender = String(process.env.EMAIL_USER || '').trim();
  const adminMailbox = getAdminMailbox() || adminSender;
  const isAdminNotification = mailType === 'confirmed';
  const isPaidMail = mailType === 'paid';
  const isShippedMail = mailType === 'shipped';
  const isDeliveredMail = mailType === 'delivered';
  const heading = isAdminNotification
    ? 'New Order Placed'
    : isDeliveredMail
      ? 'Order Delivered'
      : isShippedMail
        ? 'Order Shipped'
        : 'Payment Confirmed';
  const subject = isAdminNotification
    ? `New Order Placed #${order.order_id}`
    : isDeliveredMail
      ? `Order Delivered #${order.order_id}`
      : isShippedMail
        ? `Order Shipped #${order.order_id}`
        : `Payment Confirmed #${order.order_id}`;
  const introLine = isAdminNotification
    ? `${customerName} has placed a new order.`
    : isDeliveredMail
      ? 'Your order has been delivered successfully.'
      : isShippedMail
        ? 'Your order has been shipped.'
        : 'Your payment has been confirmed successfully.';
  const amountLabel = isAdminNotification
    ? 'Order Amount'
    : isDeliveredMail
      ? 'Delivered Order Amount'
      : isShippedMail
        ? 'Shipped Order Amount'
        : 'Paid Amount';
  const addressLine = formatAddressLine(address);

  const itemRowsHtml = items
    .map((item) => {
      const variantText = item.variant_label ? ` (${item.variant_label})` : '';
      return `<tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${item.product_name || 'Product'}${variantText}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;">${formatMoney(order.currency_code, item.price)}</td>
      </tr>`;
    })
    .join('');

  const itemRowsText = items
    .map((item, index) => {
      const variantText = item.variant_label ? ` (${item.variant_label})` : '';
      return `${index + 1}. ${item.product_name || 'Product'}${variantText} | Qty: ${item.quantity} | Price: ${formatMoney(order.currency_code, item.price)}`;
    })
    .join('\n');

  const greetingLine = isAdminNotification
    ? 'Hi Admin,'
    : `Hi ${customerName},`;
  const footerLine = isAdminNotification
    ? 'Please review and process this order from the admin panel.'
    : 'Thank you for shopping with us.';
  const customerSummary = isAdminNotification
    ? `Customer: ${customerName}\nCustomer Email: ${customerEmail || 'Not available'}\n`
    : '';
  const customerSummaryHtml = isAdminNotification
    ? `<p><strong>Customer:</strong> ${customerName}<br /><strong>Customer Email:</strong> ${customerEmail || 'Not available'}</p>`
    : '';
  const textMail = `${greetingLine}\n\n${introLine}\n\n${customerSummary}Order ID: ${order.order_id}\nOrder Date: ${new Date(order.created_at).toLocaleString()}\nStatus: ${order.status}\n${amountLabel}: ${formatMoney(order.currency_code, order.total_amount)}\nDelivery Address: ${addressLine}\n\nItems:\n${itemRowsText}\n\nSubtotal: ${formatMoney(order.currency_code, order.total_amount)}\nShipping: ${formatMoney(order.currency_code, order.shipping_cost)}\nDuties/Tax: ${formatMoney(order.currency_code, order.duties_tax)}\nTotal: ${formatMoney(order.currency_code, order.total_amount)}\n\n${footerLine}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;">
      <h2 style="margin-bottom:8px;">${heading}</h2>
      <p>${greetingLine}</p>
      <p>${introLine}</p>
      ${customerSummaryHtml}
      <p><strong>Order ID:</strong> #${order.order_id}<br />
         <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleString()}<br />
         <strong>Status:</strong> ${order.status}<br />
         <strong>${amountLabel}:</strong> ${formatMoney(order.currency_code, order.total_amount)}<br />
         <strong>Delivery Address:</strong> ${addressLine}</p>

      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:left;background:#f9fafb;">Item</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:center;background:#f9fafb;">Qty</th>
            <th style="padding:8px;border:1px solid #e5e7eb;text-align:right;background:#f9fafb;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHtml}
        </tbody>
      </table>

      <p style="margin-top:16px;">
        <strong>Subtotal:</strong> ${formatMoney(order.currency_code, order.total_amount)}<br />
        <strong>Shipping:</strong> ${formatMoney(order.currency_code, order.shipping_cost)}<br />
        <strong>Duties/Tax:</strong> ${formatMoney(order.currency_code, order.duties_tax)}<br />
        <strong>Total:</strong> ${formatMoney(order.currency_code, order.total_amount)}
      </p>

      <p>${footerLine}</p>
    </div>
  `;

  const toEmail = isAdminNotification
    ? adminMailbox
    : customerEmail;

  if (!toEmail) {
    return { skipped: true, reason: 'Missing recipient email for this mail type' };
  }

  if (!adminSender) {
    return { skipped: true, reason: 'Missing EMAIL_USER sender configuration' };
  }

  const fromHeader = `Arogya Adarsh Admin <${adminSender}>`;
  const replyToHeader = isAdminNotification
    ? (customerEmail ? `${customerName} <${customerEmail}>` : undefined)
    : getAdminMailbox();
  const finalSubject = isAdminNotification && customerEmail
    ? `${subject} - ${customerEmail}`
    : subject;

  await mailer.sendMail({
    from: fromHeader,
    to: toEmail,
    replyTo: replyToHeader,
    subject: finalSubject,
    text: textMail,
    html,
  });

  return {
    sent: true,
    mailType: getMailTypeLabel(mailType),
    to: toEmail,
    from: fromHeader,
    replyTo: replyToHeader || null,
    subject: finalSubject,
  };
};

const sendOrderConfirmationEmail = async ({ customer, order, items, address }) =>
  sendOrderEmail({ customer, order, items, address, mailType: 'confirmed' });

const sendPaymentReceivedEmail = async ({ customer, order, items, address }) =>
  sendOrderEmail({ customer, order, items, address, mailType: 'paid' });

const sendOrderShippedEmail = async ({ customer, order, items, address }) =>
  sendOrderEmail({ customer, order, items, address, mailType: 'shipped' });

const sendOrderDeliveredEmail = async ({ customer, order, items, address }) =>
  sendOrderEmail({ customer, order, items, address, mailType: 'delivered' });

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentReceivedEmail,
  sendOrderShippedEmail,
  sendOrderDeliveredEmail,
};
