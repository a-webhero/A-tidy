import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { BANGLADESH_LOCATIONS, calculateDeliveryFee } from './src/data/bangladeshLocations.js';
import { INITIAL_COUPONS, INITIAL_PRODUCTS } from './src/data/productsData.js';
import { Order, OrderStatus, Product, TrackingStep } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // In-memory data store
  let products: Product[] = [...INITIAL_PRODUCTS];
  let adminEmailLogs: any[] = [];
  let adminEmailSettings = {
    adminEmail: 'awebheroofficial@gmail.com',
    notifyOnNewCustomer: true,
    notifyOnNewOrder: true,
    notifyOnNewSeller: true,
    notifyOnNewProduct: true,
    senderName: 'LuxeShop BD Automated System',
    emailjsServiceId: 'service_z99bsab',
    emailjsTemplateId: 'template_npm7y57',
    emailjsPublicKey: 'ANbHP5Ew3uwAn-0Tn'
  };
  let orders: Order[] = [
    {
      id: 'ord-1001',
      orderNumber: 'ORD-BD-9281',
      createdAt: new Date().toISOString(),
      customerName: 'Abir Hasan',
      customerPhone: '+880 1712-345678',
      customerEmail: 'abir.hasan@example.com',
      buyerType: 'retail',
      shippingAddress: {
        fullName: 'Abir Hasan',
        phoneNumber: '+880 1712-345678',
        division: 'Dhaka',
        district: 'Dhaka City',
        thana: 'Gulshan',
        fullAddress: 'House 42, Road 11, Block D, Gulshan-1, Dhaka',
        zipCode: '1212'
      },
      deliveryZone: 'Dhaka City',
      shippingFee: 60,
      items: [
        {
          id: 'prod-iphone-16-pro-v-iphone-desert-256',
          product: INITIAL_PRODUCTS[0],
          selectedVariant: INITIAL_PRODUCTS[0].variants[0],
          quantity: 1,
          unitPrice: 165000,
          isWholesaleTierApplied: false
        }
      ],
      subtotal: 165000,
      discountAmount: 0,
      totalAmount: 165060,
      paymentDetails: {
        method: 'bkash',
        status: 'paid',
        transactionId: 'BK892301923X'
      },
      orderStatus: 'In Delivery',
      vendorId: 'vendor-apple-store',
      vendorName: 'Apple Official BD Hub',
      commissionFee: 8250, // 5%
      trackingSteps: [
        { title: 'Order Placed', description: 'Order created & payment verified', time: '10:00 AM, Today', completed: true },
        { title: 'Vendor Processing', description: 'Apple Official BD Hub packed items', time: '11:15 AM, Today', completed: true },
        { title: 'In Transit', description: 'Assigned to Pathao Express Courier', time: '02:30 PM, Today', completed: true, active: true },
        { title: 'Delivered', description: 'Package handed over to customer', time: 'Pending', completed: false }
      ],
      courierDetails: {
        riderName: 'Tanvir Hossain (Pathao Rider)',
        riderPhone: '+880 1819-998877',
        courierName: 'Pathao Express',
        trackingId: 'PTH-BD-88921'
      }
    }
  ];

  // API Routes
  // 1. Locations
  app.get('/api/locations', (req, res) => {
    res.json(BANGLADESH_LOCATIONS);
  });

  app.post('/api/locations/calculate-shipping', (req, res) => {
    const { districtId, thanaId } = req.body;
    if (!districtId || !thanaId) {
      return res.status(400).json({ error: 'districtId and thanaId are required' });
    }
    const calculation = calculateDeliveryFee(districtId, thanaId);
    res.json(calculation);
  });

  // 2. Products
  app.get('/api/products', (req, res) => {
    const { category, flashSale, vendorId } = req.query;
    let result = [...products];

    if (category && typeof category === 'string') {
      result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (flashSale === 'true') {
      result = result.filter((p) => p.isFlashSale);
    }
    if (vendorId && typeof vendorId === 'string') {
      result = result.filter((p) => p.vendorId === vendorId);
    }

    res.json(result);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = products.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  app.post('/api/products', (req, res) => {
    const newProduct: Product = {
      ...req.body,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  app.put('/api/products/:id', (req, res) => {
    const index = products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  });

  app.delete('/api/products/:id', (req, res) => {
    products = products.filter((p) => p.id !== req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  });

  // 3. Coupons
  app.post('/api/coupons/validate', (req, res) => {
    const { code, cartSubtotal } = req.body;
    const coupon = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === (code || '').toUpperCase());

    if (!coupon) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    if (cartSubtotal < coupon.minSpend) {
      return res.status(400).json({
        error: `Minimum spend of ৳${coupon.minSpend.toLocaleString()} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = Math.round((cartSubtotal * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountAmount: discount
    });
  });

  // 4. Orders
  app.get('/api/orders', (req, res) => {
    const { vendorId } = req.query;
    if (vendorId && typeof vendorId === 'string') {
      return res.json(orders.filter((o) => o.vendorId === vendorId));
    }
    res.json(orders);
  });

  app.get('/api/orders/:id', (req, res) => {
    const order = orders.find((o) => o.id === req.params.id || o.orderNumber === req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  });

  app.post('/api/orders', (req, res) => {
    const {
      customerName,
      customerPhone,
      customerEmail,
      buyerType,
      shippingAddress,
      deliveryZone,
      shippingFee,
      items,
      subtotal,
      discountAmount,
      promoCode,
      totalAmount,
      paymentDetails
    } = req.body;

    const newOrderNumber = `ORD-BD-${Math.floor(10000 + Math.random() * 90000)}`;
    const vendorId = items[0]?.product?.vendorId || 'vendor-apple-store';
    const vendorName = items[0]?.product?.vendorName || 'LuxeShop Direct Vendor';

    const trackingSteps: TrackingStep[] = [
      {
        title: 'Order Placed',
        description: `Order received. Payment method: ${paymentDetails.method.toUpperCase()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        completed: true,
        active: false
      },
      {
        title: 'Vendor Confirmation',
        description: `${vendorName} is processing and packing items`,
        time: 'In Progress',
        completed: false,
        active: true
      },
      {
        title: 'Dispatched to Courier',
        description: 'Courier partner assigned for dispatch',
        time: 'Pending',
        completed: false
      },
      {
        title: 'Out for Delivery',
        description: 'Delivery rider is heading to your address',
        time: 'Pending',
        completed: false
      },
      {
        title: 'Delivered',
        description: 'Order successfully delivered & completed',
        time: 'Pending',
        completed: false
      }
    ];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
      customerName,
      customerPhone,
      customerEmail,
      buyerType: buyerType || 'retail',
      shippingAddress,
      deliveryZone,
      shippingFee,
      items,
      subtotal,
      discountAmount: discountAmount || 0,
      promoCode,
      totalAmount,
      paymentDetails: {
        ...paymentDetails,
        transactionId: paymentDetails.transactionId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      },
      orderStatus: 'Pending',
      vendorId,
      vendorName,
      commissionFee: Math.round(subtotal * 0.05), // 5% platform commission
      trackingSteps,
      courierDetails: {
        riderName: 'Kamrul Hasan (E-Courier Rider)',
        riderPhone: '+880 1711-223344',
        courierName: 'E-Courier Express',
        trackingId: `EC-${Math.floor(100000 + Math.random() * 900000)}`
      }
    };

    // Deduct stock
    items.forEach((cartItem: any) => {
      const prod = products.find((p) => p.id === cartItem.product.id);
      if (prod && cartItem.selectedVariant) {
        const variant = prod.variants.find((v) => v.id === cartItem.selectedVariant.id);
        if (variant && variant.stock >= cartItem.quantity) {
          variant.stock -= cartItem.quantity;
        }
      }
    });

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id/status', (req, res) => {
    const { status } = req.body as { status: OrderStatus };
    const orderIndex = orders.findIndex((o) => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];
    order.orderStatus = status;

    // Update tracking steps dynamically based on status
    if (status === 'Confirmed') {
      order.trackingSteps[1].completed = true;
      order.trackingSteps[1].active = false;
      order.trackingSteps[2].active = true;
    } else if (status === 'Dispatched') {
      order.trackingSteps[1].completed = true;
      order.trackingSteps[2].completed = true;
      order.trackingSteps[2].active = false;
      order.trackingSteps[3].active = true;
    } else if (status === 'In Delivery') {
      order.trackingSteps[1].completed = true;
      order.trackingSteps[2].completed = true;
      order.trackingSteps[3].completed = true;
      order.trackingSteps[3].active = false;
      order.trackingSteps[4].active = true;
    } else if (status === 'Delivered') {
      order.trackingSteps.forEach((s) => {
        s.completed = true;
        s.active = false;
      });
      order.paymentDetails.status = 'paid';
    }

    res.json(order);
  });

  app.patch('/api/orders/:id/courier', (req, res) => {
    const { courierDetails, status } = req.body;
    const orderIndex = orders.findIndex((o) => o.id === req.params.id);

    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[orderIndex];
    if (courierDetails) {
      order.courierDetails = courierDetails;
    }
    if (status) {
      order.orderStatus = status;
      if (status === 'In Delivery' && order.trackingSteps && order.trackingSteps.length >= 5) {
        order.trackingSteps[1].completed = true;
        order.trackingSteps[2].completed = true;
        order.trackingSteps[3].completed = true;
        order.trackingSteps[3].active = false;
        order.trackingSteps[4].active = true;
      }
    }

    res.json(order);
  });

  // 5. Vendor & Admin Stats
  app.get('/api/admin/stats', (req, res) => {
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCommission = orders.reduce((sum, o) => sum + o.commissionFee, 0);
    const totalOrders = orders.length;

    res.json({
      totalRevenue,
      totalCommission,
      totalOrders,
      totalProducts: products.length,
      vendorsCount: 3,
      recentOrders: orders.slice(0, 5)
    });
  });

  // 6. Admin Automated Email Notifications API
  app.post('/api/admin/notify-email', async (req, res) => {
    const { type, adminEmail, logEntry, templateParams, serviceId, templateId, publicKey } = req.body;
    const recipient = adminEmail || adminEmailSettings.adminEmail;
    const sId = serviceId || adminEmailSettings.emailjsServiceId;
    const tId = templateId || adminEmailSettings.emailjsTemplateId;
    const pKey = publicKey || adminEmailSettings.emailjsPublicKey;

    const entry = logEntry || {
      id: `srv-email-${Date.now()}`,
      eventType: type || 'custom',
      eventTitle: `System Notification: ${type}`,
      recipientEmail: recipient,
      subject: `[LuxeShop Admin] ${type} notification`,
      body: `Automated email notification triggered for event: ${type}`,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    adminEmailLogs.unshift(entry);
    console.log(`[AUTOMATED ADMIN EMAIL SENT] -> To: ${recipient} | Type: ${type} | Subject: ${entry.subject}`);

    // If client hasn't sent directly or as server backup, attempt EmailJS REST API
    if (templateParams && sId && tId && pKey) {
      try {
        const emailjsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: sId,
            template_id: tId,
            user_id: pKey,
            template_params: templateParams,
          }),
        });
        const resText = await emailjsRes.text();
        console.log(`[EmailJS REST API Response]: ${emailjsRes.status} - ${resText}`);
      } catch (err) {
        console.error('[EmailJS REST API Error]:', err);
      }
    }

    res.json({
      success: true,
      message: `Admin notification email processed for ${recipient}`,
      logEntry: entry
    });
  });

  app.get('/api/admin/email-logs', (req, res) => {
    res.json({
      settings: adminEmailSettings,
      logs: adminEmailLogs
    });
  });

  app.post('/api/admin/email-settings', (req, res) => {
    adminEmailSettings = {
      ...adminEmailSettings,
      ...req.body
    };
    res.json({
      success: true,
      settings: adminEmailSettings
    });
  });

  // Vite middleware for dev or Static serve for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LuxeShop BD Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
