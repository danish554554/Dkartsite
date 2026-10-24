/**
 * Instant Phone Push Notification Service for Dkart Store Admin
 * Sends real-time push alerts to phone with sound and vibration via high-priority push channel.
 */

export async function sendOrderPushNotification(order, items) {
  const city = order.shipping_address?.city || 'Pakistan';
  const total = Number(order.total || 0).toLocaleString();
  const itemList = (items || []).map(i => `${i.title} (${i.quantity}x)`).join(', ');

  const title = `🚨 New Order #${order.id} — Rs. ${total}`;
  const message = `Customer: ${order.customer_name} (${order.customer_phone})\nCity: ${city}\nItems: ${itemList}\nCOD: Rs. ${total}`;
  const topic = process.env.PUSH_TOPIC || 'dkart_orders_notify';

  try {
    const res = await fetch('https://ntfy.sh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        title,
        message,
        priority: 5, // Urgent / High-priority ring
        tags: ['tada', 'package', 'moneybag'],
        click: 'https://www.dkart.pk/admin'
      })
    });

    if (res.ok) {
      console.log(`✅ [Push] Instant phone alert dispatched to topic: ${topic}`);
    } else {
      console.warn(`⚠️ [Push] Dispatch status: ${res.status}`);
    }
  } catch (err) {
    console.warn('⚠️ [Push] Dispatch error (non-fatal):', err.message);
  }
}
