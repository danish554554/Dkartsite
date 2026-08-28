/**
 * WhatsApp Order Notification Generator for Dkart.pk
 * Generates formatted text receipts with emojis for Pakistani buyers and store managers.
 */

export function generateCustomerWhatsAppReceipt(order, items) {
  let addressObj = {};
  try {
    addressObj = typeof order.shipping_address === 'string'
      ? JSON.parse(order.shipping_address)
      : (order.shipping_address || {});
  } catch {
    addressObj = { address: order.shipping_address };
  }

  const itemsList = items
    .map((item, idx) => `${idx + 1}. *${item.title}* ${item.variant_name ? `(${item.variant_name})` : ''} - Qty: ${item.quantity} (Rs. ${Number(item.price * item.quantity).toLocaleString()})`)
    .join('\n');

  const text = `🛍️ *DKART.PK — ORDER CONFIRMATION* 🇵🇰
━━━━━━━━━━━━━━━━━━━━
Assalam-o-Alaikum *${order.customer_name}*,

Thank you for shopping with *Dkart.pk*! Your order has been placed successfully.

📄 *Order ID:* #${order.id}
📅 *Date:* ${new Date().toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
📦 *Payment Method:* Cash on Delivery (COD)

🛒 *ITEMS ORDERED:*
${itemsList}

━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* Rs. ${Number(order.subtotal).toLocaleString()}
🚚 *Shipping (Express):* ${order.shipping_fee > 0 ? `Rs. ${Number(order.shipping_fee).toLocaleString()}` : 'FREE'}
${order.discount > 0 ? `🎁 *Discount:* - Rs. ${Number(order.discount).toLocaleString()}\n` : ''}💵 *TOTAL PAYABLE (COD):* *Rs. ${Number(order.total).toLocaleString()}*
━━━━━━━━━━━━━━━━━━━━

📍 *DELIVERY ADDRESS:*
${addressObj.address || ''}, ${addressObj.city || ''}, ${addressObj.province || ''}
📞 *Contact Phone:* ${order.customer_phone}

🚚 *DELIVERY TIMELINE:*
Your parcel will be delivered within *2 to 4 working days* via Leopard/TCS Courier. Please keep the exact cash ready upon delivery.

🛡️ *7-Day Free Replacement Guarantee Included.*

💬 *Need Help or Modifications?*
Reply to this message or WhatsApp our Helpline at *0342-5097760*.
🌐 Track Online: https://www.dkart.pk/track?orderId=${order.id}`;

  return {
    text,
    customerWaLink: `https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(text)}`,
    adminWaLink: `https://wa.me/923425097760?text=${encodeURIComponent(`🚨 *NEW ORDER #${order.id}*\nCustomer: ${order.customer_name} (${order.customer_phone})\nCity: ${addressObj.city || ''}\nTotal COD: Rs. ${Number(order.total).toLocaleString()}\nItems:\n${itemsList}`)}`
  };
}
