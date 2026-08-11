import emailjs from '@emailjs/browser';

export interface AdminEmailLog {
  id: string;
  eventType: 'new_customer' | 'new_order' | 'new_seller' | 'new_product' | 'test';
  eventTitle: string;
  recipientEmail: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'failed';
  errorDetails?: string;
  metadata?: any;
}

export interface AdminEmailSettings {
  adminEmail: string;
  notifyOnNewCustomer: boolean;
  notifyOnNewOrder: boolean;
  notifyOnNewSeller: boolean;
  notifyOnNewProduct: boolean;
  senderName: string;
  emailjsServiceId: string;
  emailjsTemplateId: string;
  emailjsPublicKey: string;
}

export const DEFAULT_ADMIN_EMAIL_SETTINGS: AdminEmailSettings = {
  adminEmail: 'awebheroofficial@gmail.com',
  notifyOnNewCustomer: true,
  notifyOnNewOrder: true,
  notifyOnNewSeller: true,
  notifyOnNewProduct: true,
  senderName: 'LuxeShop BD Automated System',
  emailjsServiceId: 'service_z99bsab',
  emailjsTemplateId: 'template_npm7y57',
  emailjsPublicKey: 'ANbHP5Ew3uwAn-0Tn',
};

// Retrieve Settings
export function getAdminEmailSettings(): AdminEmailSettings {
  try {
    const saved = localStorage.getItem('luxeshop_admin_email_settings');
    if (saved) {
      return { ...DEFAULT_ADMIN_EMAIL_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Error reading admin email settings:', e);
  }
  return DEFAULT_ADMIN_EMAIL_SETTINGS;
}

// Save Settings
export function saveAdminEmailSettings(settings: AdminEmailSettings): void {
  try {
    localStorage.setItem('luxeshop_admin_email_settings', JSON.stringify(settings));
    // Sync with server if available
    fetch('/api/admin/email-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    }).catch(() => {});
  } catch (e) {
    console.error('Error saving admin email settings:', e);
  }
}

// Retrieve Logs
export function getAdminEmailLogs(): AdminEmailLog[] {
  try {
    const saved = localStorage.getItem('luxeshop_admin_email_logs');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error reading admin email logs:', e);
  }
  return [];
}

// Send Admin Email Notification using EmailJS & API
export async function sendAdminEmailNotification(
  type: 'new_customer' | 'new_order' | 'new_seller' | 'new_product' | 'test',
  details: Record<string, any>
): Promise<AdminEmailLog | null> {
  const settings = getAdminEmailSettings();

  // Check toggles
  if (type === 'new_customer' && !settings.notifyOnNewCustomer) return null;
  if (type === 'new_order' && !settings.notifyOnNewOrder) return null;
  if (type === 'new_seller' && !settings.notifyOnNewSeller) return null;
  if (type === 'new_product' && !settings.notifyOnNewProduct) return null;

  const adminEmail = settings.adminEmail || DEFAULT_ADMIN_EMAIL_SETTINGS.adminEmail;
  const serviceId = settings.emailjsServiceId || DEFAULT_ADMIN_EMAIL_SETTINGS.emailjsServiceId;
  const templateId = settings.emailjsTemplateId || DEFAULT_ADMIN_EMAIL_SETTINGS.emailjsTemplateId;
  const publicKey = settings.emailjsPublicKey || DEFAULT_ADMIN_EMAIL_SETTINGS.emailjsPublicKey;

  const timestamp = new Date().toISOString();
  const logId = `email-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  let eventTitle = '';
  let subject = '';
  let body = '';

  if (type === 'new_customer') {
    eventTitle = 'New Customer Account Created';
    subject = `👤 [NEW CUSTOMER] ${details.name || 'Customer'} registered on LuxeShop BD`;
    body = `A new customer account has been created on LuxeShop BD!

• Customer Name: ${details.name || 'N/A'}
• Email Address: ${details.email || 'N/A'}
• Phone Number: ${details.phone || 'N/A'}
• Registration Time: ${new Date().toLocaleString()}

Please check the admin panel user management to view customer details.`;
  } else if (type === 'new_order') {
    eventTitle = 'New Order Received';
    subject = `🛒 [NEW ORDER] ${details.orderNumber || 'ORD-BD'} - Total ৳${Number(details.totalAmount || 0).toLocaleString()} (${details.customerName || 'Customer'})`;
    body = `A new order has been placed on LuxeShop BD!

• Order Number: ${details.orderNumber || 'N/A'}
• Customer Name: ${details.customerName || 'N/A'}
• Phone: ${details.customerPhone || 'N/A'}
• Email: ${details.customerEmail || 'N/A'}
• Total Payable: ৳${Number(details.totalAmount || 0).toLocaleString()}
• Payment Method: ${String(details.paymentMethod || 'bKash').toUpperCase()}
• Delivery Zone: ${details.deliveryZone || 'Standard Delivery'}
• Order Time: ${new Date().toLocaleString()}

Log in to the Admin Panel to confirm, process, or dispatch this order.`;
  } else if (type === 'new_seller') {
    eventTitle = 'New Seller Account Created';
    subject = `🏪 [NEW SELLER] Shop: "${details.shopName || 'Vendor'}" registered as seller`;
    body = `A new seller / merchant account has been registered on LuxeShop BD!

• Shop / Brand Name: ${details.shopName || 'N/A'}
• Owner Name: ${details.ownerName || 'N/A'}
• Seller Phone (Login ID): ${details.phone || 'N/A'}
• Email Address: ${details.email || 'N/A'}
• Registration Time: ${new Date().toLocaleString()}

Log in to the Admin Panel to review and verify this vendor.`;
  } else if (type === 'new_product') {
    eventTitle = 'New Product Added';
    subject = `📦 [NEW PRODUCT] "${details.title || 'Product'}" published by ${details.vendorName || 'Vendor'}`;
    body = `A new product has been published on LuxeShop BD!

• Product Title: ${details.title || 'N/A'}
• Vendor / Shop: ${details.vendorName || 'LuxeShop Direct'}
• Category: ${details.category || 'General'}
• Base Price: ৳${Number(details.basePrice || 0).toLocaleString()}
• Added Time: ${new Date().toLocaleString()}

You can view or edit this product from the Admin Panel Products list.`;
  } else if (type === 'test') {
    eventTitle = 'System Test Email';
    subject = `⚡ [TEST EMAIL] Admin Notification System Verification`;
    body = `This is a test notification email sent to verify that automated admin emails are working properly via EmailJS.

• Target Admin Email: ${adminEmail}
• Sender: ${settings.senderName}
• EmailJS Service: ${serviceId}
• EmailJS Template: ${templateId}
• Status: System Operational & Active
• Sent At: ${new Date().toLocaleString()}

All future customer signups, new orders, seller registrations, and product additions will send emails directly to this address!`;
  }

  // Template Parameters map all potential EmailJS template variable names
  const templateParams = {
    to_email: adminEmail,
    email: adminEmail,
    recipient_email: adminEmail,
    admin_email: adminEmail,
    to_name: 'LuxeShop Admin',
    from_name: settings.senderName,
    sender_name: settings.senderName,
    subject: subject,
    title: eventTitle,
    event_type: type,
    event_title: eventTitle,
    message: body,
    body: body,
    details: JSON.stringify(details, null, 2),
    reply_to: adminEmail,
    // Specific field shortcuts for templates
    user_name: details.name || details.customerName || details.ownerName || '',
    user_phone: details.phone || details.customerPhone || '',
    user_email: details.email || details.customerEmail || '',
    order_number: details.orderNumber || '',
    total_amount: details.totalAmount ? `৳${Number(details.totalAmount).toLocaleString()}` : '',
    product_title: details.title || '',
    shop_name: details.shopName || '',
  };

  let deliveryStatus: 'sent' | 'delivered' | 'failed' = 'sent';
  let errorDetails = undefined;

  // 1. Dispatch directly via EmailJS browser SDK
  try {
    if (publicKey && serviceId && templateId) {
      console.log(`[EmailJS] Dispatching email to ${adminEmail}...`);
      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log('[EmailJS] Success response:', response.status, response.text);
      deliveryStatus = 'delivered';
    }
  } catch (emailErr: any) {
    console.error('[EmailJS] Direct send error:', emailErr);
    deliveryStatus = 'failed';
    errorDetails = emailErr?.text || emailErr?.message || String(emailErr);
  }

  const logEntry: AdminEmailLog = {
    id: logId,
    eventType: type,
    eventTitle,
    recipientEmail: adminEmail,
    subject,
    body,
    timestamp,
    status: deliveryStatus,
    errorDetails,
    metadata: details,
  };

  // Save log locally
  const currentLogs = getAdminEmailLogs();
  const updatedLogs = [logEntry, ...currentLogs.slice(0, 99)]; // keep last 100
  try {
    localStorage.setItem('luxeshop_admin_email_logs', JSON.stringify(updatedLogs));
  } catch (e) {
    console.error('Error saving email log to localStorage:', e);
  }

  // 2. Trigger server API endpoint for logging and server-side EmailJS dispatch backup
  try {
    await fetch('/api/admin/notify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        adminEmail,
        logEntry,
        templateParams,
        serviceId,
        templateId,
        publicKey,
      }),
    });
  } catch (e) {
    console.log('Server email notify logging complete:', e);
  }

  // Dispatch custom event for real-time UI update
  try {
    window.dispatchEvent(new CustomEvent('admin_email_sent', { detail: logEntry }));
  } catch (e) {}

  return logEntry;
}

