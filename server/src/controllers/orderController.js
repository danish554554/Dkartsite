import { query, queryOne, queryAll, execute, pool } from '../database/db.js';
import { sendOrderEmails } from '../services/emailService.js';
import { generateCustomerWhatsAppReceipt } from '../services/whatsappService.js';

export const createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      paymentMethod = 'cod',
      items,
      couponCode,
      notes
    } = req.body;

    if (!customerName || !customerPhone || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Missing required order details.' });
    }

    const userId = req.user ? req.user.id : null;

    // Verify products & calculate verified totals
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const pRes = await client.query(`
        SELECT id, title, price, sale_price, stock_quantity, 
               (SELECT url FROM product_images WHERE product_id = products.id LIMIT 1) as image 
        FROM products WHERE id = $1
      `, [item.productId]);
      const product = pRes.rows[0];

      if (!product) {
        return res.status(400).json({ success: false, message: `Product ID ${item.productId} was not found.` });
      }

      const unitPrice = product.sale_price !== null && product.sale_price !== undefined ? Number(product.sale_price) : Number(product.price);
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      verifiedItems.push({
        productId: product.id,
        title: product.title,
        image: product.image || item.image || '',
        variantName: item.variantName || 'Standard',
        unitPrice,
        price: unitPrice,
        quantity: qty,
        subtotal: lineTotal
      });
    }

    // Apply Coupon if valid
    let discountAmount = 0;
    if (couponCode) {
      const cRes = await client.query('SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true', [couponCode.trim()]);
      const coupon = cRes.rows[0];
      if (coupon && subtotal >= Number(coupon.min_spend || 0)) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
        } else {
          discountAmount = Math.min(Number(coupon.discount_value), subtotal);
        }
      }
    }

    // Nationwide shipping policy: Free on orders Rs. 3,000 and above, otherwise Rs. 199
    const shippingFee = subtotal >= 3000 ? 0 : 199;
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // Generate Order ID & Courier Tracking
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderId = `DK-${randomSuffix}`;
    const trackingNumber = `TCS-${Math.floor(1000000 + Math.random() * 9000000)}`;

    await client.query('BEGIN');

    await client.query(`
      INSERT INTO orders (
        id, user_id, customer_name, customer_phone, customer_email,
        shipping_address, payment_method, payment_status, order_status,
        subtotal, discount_amount, shipping_fee, total_amount, coupon_code,
        notes, tracking_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `, [
      orderId,
      userId,
      customerName.trim(),
      customerPhone.trim(),
      customerEmail ? customerEmail.trim() : null,
      typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress,
      paymentMethod,
      paymentMethod === 'cod' ? 'pending' : 'paid',
      'Confirmed',
      subtotal,
      discountAmount,
      shippingFee,
      totalAmount,
      couponCode || null,
      notes || null,
      trackingNumber
    ]);

    for (const item of verifiedItems) {
      await client.query(`
        INSERT INTO order_items (
          order_id, product_id, title, image, variant_name, unit_price, quantity, subtotal
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        orderId,
        item.productId,
        item.title,
        item.image,
        item.variantName,
        item.unitPrice,
        item.quantity,
        item.subtotal
      ]);

      await client.query(`
        UPDATE products 
        SET stock_quantity = GREATEST(0, stock_quantity - $1),
            is_in_stock = (stock_quantity - $1 > 0)
        WHERE id = $2
      `, [item.quantity, item.productId]);
    }

    await client.query('COMMIT');

    const orderPayload = {
      id: orderId,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail ? customerEmail.trim() : null,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      subtotal,
      discount: discountAmount,
      shipping_fee: shippingFee,
      total: totalAmount,
      tracking_number: trackingNumber
    };

    // Trigger Email notifications to Customer & Admin
    sendOrderEmails(orderPayload, verifiedItems).catch((err) => {
      console.error('Background email notification error:', err);
    });

    // Generate WhatsApp Receipt
    const whatsappData = generateCustomerWhatsAppReceipt(orderPayload, verifiedItems);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Cash on delivery booked.',
      order: {
        id: orderId,
        customerName,
        customerPhone,
        customerEmail,
        shippingAddress: typeof shippingAddress === 'string' ? JSON.parse(shippingAddress) : shippingAddress,
        paymentMethod,
        orderStatus: 'Confirmed',
        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,
        trackingNumber,
        items: verifiedItems,
        createdAt: new Date().toISOString()
      },
      whatsApp: whatsappData
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order.' });
  } finally {
    client.release();
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await queryOne('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [id]);

    res.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        discount_amount: Number(order.discount_amount),
        shipping_fee: Number(order.shipping_fee),
        total_amount: Number(order.total_amount),
        shipping_address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address,
        items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), subtotal: Number(i.subtotal) }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve order.' });
  }
};

export const trackOrder = async (req, res) => {
  try {
    const { orderId, phone } = req.query;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    let sql = 'SELECT * FROM orders WHERE id = ?';
    const params = [orderId.trim().toUpperCase()];

    if (phone) {
      sql += ' AND customer_phone ILIKE ?';
      params.push(`%${phone.trim()}%`);
    }

    const order = await queryOne(sql, params);
    if (!order) {
      return res.status(404).json({ success: false, message: 'No matching order found. Please check your Order ID and phone number.' });
    }

    const items = await queryAll('SELECT title, image, variant_name, quantity, unit_price, subtotal FROM order_items WHERE order_id = ?', [order.id]);

    res.json({
      success: true,
      order: {
        id: order.id,
        status: order.order_status,
        customerName: order.customer_name,
        trackingNumber: order.tracking_number,
        courier: 'TCS Express Pakistan',
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        totalAmount: Number(order.total_amount),
        createdAt: order.created_at,
        items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), subtotal: Number(i.subtotal) }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to track order.' });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await queryAll('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const formattedOrders = await Promise.all(orders.map(async order => {
      const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      return {
        ...order,
        subtotal: Number(order.subtotal),
        discount_amount: Number(order.discount_amount),
        shipping_fee: Number(order.shipping_fee),
        total_amount: Number(order.total_amount),
        shipping_address: typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address,
        items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), subtotal: Number(i.subtotal) }))
      };
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve your order history.' });
  }
};
