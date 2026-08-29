import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter
let transporter = null;

// Helper to send email via Brevo REST API (HTTPS port 443 - zero firewall blocks)
async function sendViaBrevoApi({ to, subject, htmlContent, senderEmail, senderName, apiKey }) {
  const payload = {
    sender: { name: senderName || 'Dkart.pk', email: senderEmail || 'admindkart@gmail.com' },
    to: Array.isArray(to) ? to.map(e => ({ email: e })) : [{ email: to }],
    subject,
    htmlContent
  };
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  return data;
}

// Helper to send email via Resend REST API (HTTPS port 443)
async function sendViaResendApi({ to, subject, html, from, apiKey }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: from || 'Dkart <onboarding@resend.dev>',
      to: Array.isArray(to) ? to : [to],
      subject,
      html
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  return data;
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    if (host.toLowerCase().includes('gmail')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
        family: 4 // Force IPv4
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        family: 4, // Force IPv4
        connectionTimeout: 15000,
        greetingTimeout: 15000,
        socketTimeout: 20000,
        tls: {
          rejectUnauthorized: false
        }
      });
    }
  } else {
    transporter = null;
  }
  return transporter;
}

/**
 * Generate luxury responsive HTML email for the Customer
 */
export function generateCustomerEmailHtml(order, items) {
  let addressObj = {};
  try {
    addressObj = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : (order.shipping_address || {});
  } catch {
    addressObj = { address: order.shipping_address };
  }

  const itemsHtml = items.map(item => {
    const rawImg = item.image || item.image_url || item.primary_image || '';
    let fullImgUrl = 'https://www.dkart.pk/logo.png';
    if (rawImg) {
      const cleanImg = rawImg.replace(/\.webp$/i, '.jpg');
      if (cleanImg.startsWith('http')) {
        fullImgUrl = cleanImg;
      } else {
        fullImgUrl = `https://www.dkart.pk${cleanImg.startsWith('/') ? '' : '/'}${cleanImg}`;
      }
    }

    return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f0f0f0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td width="64" valign="top" style="padding-right: 14px;">
              <img src="${fullImgUrl}" 
                   alt="${item.title}" 
                   width="60" 
                   height="60" 
                   style="border-radius: 8px; object-fit: cover; border: 1px solid #eaeaea; display: block;" />
            </td>
            <td valign="top">
              <div style="font-size: 14px; font-weight: 700; color: #1927F4; line-height: 1.3; margin-bottom: 4px;">
                ${item.title}
              </div>
              ${item.variantName || item.variant_name ? `<div style="font-size: 12px; color: #666; margin-bottom: 3px;">Variant: <strong>${item.variantName || item.variant_name}</strong></div>` : ''}
              <div style="font-size: 12px; color: #888;">Qty: ${item.quantity} × Rs. ${Number(item.price || item.unitPrice || 0).toLocaleString()}</div>
            </td>
            <td width="90" valign="top" align="right" style="font-size: 14px; font-weight: 800; color: #222;">
              Rs. ${(Number(item.price || item.unitPrice || 0) * item.quantity).toLocaleString()}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Dkart.pk</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #414042;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f4f6f9; padding: 25px 10px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="background-color: #1927F4; padding: 30px 35px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <div style="font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      d<span style="color: #FF9100;">k</span>art<span style="font-size: 16px; color: #FF9100; vertical-align: super;">.pk</span>
                    </div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 4px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">
                      Pakistan's Premier Online Shopping Destination
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ORDER CONFIRMATION BANNER -->
          <tr>
            <td style="padding: 30px 35px 20px 35px; text-align: center; border-bottom: 1px solid #edf0f5;">
              <div style="display: inline-block; background-color: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 800; padding: 6px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">
                ✓ Order Confirmed (Cash on Delivery)
              </div>
              <h1 style="font-size: 22px; font-weight: 800; color: #1927F4; margin: 0 0 8px 0;">
                Thank you for your order, ${order.customer_name}!
              </h1>
              <p style="font-size: 14px; color: #666; margin: 0; line-height: 1.5;">
                We have received your order <strong>#${order.id}</strong>. Our logistics team is now preparing your parcel for express dispatch.
              </p>
            </td>
          </tr>

          <!-- ORDER ITEMS TABLE -->
          <tr>
            <td style="padding: 25px 35px;">
              <div style="font-size: 15px; font-weight: 800; color: #222; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 2px solid #1927F4; padding-bottom: 6px;">
                Order Summary
              </div>
              
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                ${itemsHtml}
              </table>

              <!-- TOTALS SECTION -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 15px; border-top: 1px solid #e0e0e0; padding-top: 12px;">
                <tr>
                  <td style="font-size: 13px; color: #666; padding: 4px 0;">Subtotal</td>
                  <td align="right" style="font-size: 13px; font-weight: 700; color: #333;">Rs. ${Number(order.subtotal).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #666; padding: 4px 0;">Shipping (Nationwide Express)</td>
                  <td align="right" style="font-size: 13px; font-weight: 700; color: ${order.shipping_fee > 0 ? '#333' : '#2e7d32'};">
                    ${order.shipping_fee > 0 ? `Rs. ${Number(order.shipping_fee).toLocaleString()}` : 'FREE'}
                  </td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td style="font-size: 13px; color: #2e7d32; padding: 4px 0;">Coupon Discount</td>
                  <td align="right" style="font-size: 13px; font-weight: 700; color: #2e7d32;">- Rs. ${Number(order.discount).toLocaleString()}</td>
                </tr>` : ''}
                <tr>
                  <td style="font-size: 16px; font-weight: 900; color: #1927F4; padding: 10px 0 0 0; border-top: 1px solid #f0f0f0;">
                    Total Payable (Cash on Delivery)
                  </td>
                  <td align="right" style="font-size: 18px; font-weight: 900; color: #FF9100; padding: 10px 0 0 0; border-top: 1px solid #f0f0f0;">
                    Rs. ${Number(order.total).toLocaleString()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SHIPPING & CUSTOMER DETAILS -->
          <tr>
            <td style="padding: 0 35px 25px 35px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px;">
                <tr>
                  <td>
                    <div style="font-size: 14px; font-weight: 800; color: #1927F4; margin-bottom: 8px;">
                      📦 Delivery Information
                    </div>
                    <div style="font-size: 13px; color: #333; line-height: 1.5;">
                      <strong>Recipient:</strong> ${order.customer_name}<br>
                      <strong>Phone Number:</strong> ${order.customer_phone}<br>
                      <strong>Delivery Address:</strong> ${addressObj.address || ''}, ${addressObj.city || ''}, ${addressObj.province || ''}<br>
                      <strong>Payment Method:</strong> Cash on Delivery (COD)<br>
                      <strong>Delivery Timeline:</strong> 2 to 4 Working Days (via TCS / Leopard Courier)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ACTIONS & HELPLINE BUTTONS -->
          <tr>
            <td style="padding: 0 35px 30px 35px; text-align: center;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <a href="https://www.dkart.pk/track?orderId=${order.id}&phone=${encodeURIComponent(order.customer_phone)}" 
                       style="display: inline-block; background-color: #1927F4; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; padding: 12px 28px; border-radius: 10px; box-shadow: 0 4px 12px rgba(25,39,244,0.3);">
                      🔍 Track Your Order Online
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="https://wa.me/923425097760?text=Hi%20Dkart,%20I%20have%20an%20inquiry%20regarding%20my%20order%20%23${order.id}" 
                       style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 10px;">
                      💬 Need Help? WhatsApp 0342-5097760
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BRAND PROMISE & GUARANTEE -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 35px; text-align: center; border-top: 1px solid #edf0f5;">
              <div style="font-size: 12px; font-weight: 700; color: #414042; margin-bottom: 4px;">
                🛡️ 7-Day Hassle-Free Replacement Guarantee
              </div>
              <div style="font-size: 11px; color: #777; line-height: 1.4;">
                Every parcel is tested and packed under strict quality control. If your product is damaged or defective upon arrival, WhatsApp us at 0342-5097760 for an instant replacement.
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #1a1a1a; padding: 20px 35px; text-align: center; color: #999; font-size: 11px;">
              <div style="color: #fff; font-weight: 700; font-size: 13px; margin-bottom: 4px;">
                Dkart.pk — Official Store
              </div>
              <div>Islamabad / Karachi / Lahore, Pakistan | Helpline: +92 342 5097760</div>
              <div style="margin-top: 8px; color: #666;">© 2026 Dkart.pk. All rights reserved.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Generate high-priority Executive Alert HTML email for the Store Owner / Admin
 */
function generateAdminEmailHtml(order, items) {
  let addressObj = {};
  try {
    addressObj = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : (order.shipping_address || {});
  } catch {
    addressObj = { address: order.shipping_address };
  }

  const itemsHtml = items.map(item => {
    const rawImg = item.image || item.image_url || item.primary_image || '';
    let fullImgUrl = 'https://www.dkart.pk/logo.png';
    if (rawImg) {
      const cleanImg = rawImg.replace(/\.webp$/i, '.jpg');
      if (cleanImg.startsWith('http')) fullImgUrl = cleanImg;
      else fullImgUrl = `https://www.dkart.pk${cleanImg.startsWith('/') ? '' : '/'}${cleanImg}`;
    }

    return `
    <tr>
      <td width="48" style="padding: 8px 10px 8px 0; border-bottom: 1px solid #eee;">
        <img src="${fullImgUrl}" width="42" height="42" style="border-radius: 6px; object-fit: cover; border: 1px solid #eee; display: block;" alt="" />
      </td>
      <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px;">
        <strong>${item.title}</strong> ${item.variantName || item.variant_name ? `(${item.variantName || item.variant_name})` : ''} 
        <span style="color: #888;">× ${item.quantity}</span>
      </td>
      <td align="right" style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 13px; font-weight: 700;">
        Rs. ${(Number(item.price || item.unitPrice || 0) * item.quantity).toLocaleString()}
      </td>
    </tr>
  `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px; color: #333;">
  <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #ddd;">
    <div style="background: #1927F4; color: #fff; padding: 20px; text-align: center;">
      <h2 style="margin: 0; font-size: 22px;">🚨 NEW ORDER RECEIVED — DKART.PK</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Order ID: <strong>#${order.id}</strong></p>
    </div>

    <div style="padding: 20px;">
      <div style="background: #fff8e1; border-left: 4px solid #FF9100; padding: 12px; margin-bottom: 18px;">
        <strong style="color: #b78103;">Cash on Delivery Amount to Collect:</strong>
        <div style="font-size: 20px; font-weight: 900; color: #FF9100; margin-top: 4px;">
          Rs. ${Number(order.total).toLocaleString()}
        </div>
      </div>

      <h3 style="margin-top: 0; color: #1927F4; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 6px;">Customer Details</h3>
      <p style="font-size: 13px; line-height: 1.6; margin: 0 0 15px 0;">
        <strong>Name:</strong> ${order.customer_name}<br>
        <strong>Phone:</strong> <a href="tel:${order.customer_phone}">${order.customer_phone}</a><br>
        <strong>Email:</strong> ${order.customer_email || 'Not provided'}<br>
        <strong>Full Address:</strong> ${addressObj.address || ''}, ${addressObj.city || ''}, ${addressObj.province || ''}<br>
        <strong>Payment:</strong> Cash on Delivery (COD)
      </p>

      <h3 style="color: #1927F4; font-size: 15px; border-bottom: 1px solid #eee; padding-bottom: 6px;">Ordered Items</h3>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemsHtml}
      </table>

      <div style="margin-top: 25px; text-align: center;">
        <a href="https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}?text=Assalam%20o%20Alaikum%20${encodeURIComponent(order.customer_name)},%20this%20is%20Dkart.pk%20regarding%20your%20order%20%23${order.id}." 
           style="display: inline-block; background: #25D366; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px; margin-right: 8px;">
          💬 WhatsApp Customer
        </a>
        <a href="https://www.dkart.pk/admin/orders" 
           style="display: inline-block; background: #1927F4; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 13px;">
          📋 Open Admin Portal
        </a>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Send order notifications via Email to both Customer and Admin
 */
export async function sendOrderEmails(order, items) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'admindkart@gmail.com';
    const sender = process.env.SMTP_FROM || `"Dkart.pk" <${process.env.SMTP_USER || 'admindkart@gmail.com'}>`;
    const orderTotal = Number(order.total_amount || order.total || 0).toLocaleString();

    const customerHtml = generateCustomerEmailHtml(order, items);
    const adminHtml = generateAdminEmailHtml(order, items);

    const brevoApiKey = process.env.BREVO_API_KEY || (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('xkeysib-') ? process.env.SMTP_PASS : null);
    const resendApiKey = process.env.RESEND_API_KEY || (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('re_') ? process.env.SMTP_PASS : null);

    // MODE 1: Brevo REST API (HTTPS Port 443 - zero block)
    if (brevoApiKey) {
      const brevoSender = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_USER || 'admindkart@gmail.com';
      console.log(`⚡ Dispatching emails via Brevo HTTPS REST API (Sender: ${brevoSender})...`);
      if (order.customer_email && order.customer_email.includes('@')) {
        await sendViaBrevoApi({
          to: order.customer_email,
          subject: `Order Confirmation #${order.id} - Dkart.pk`,
          htmlContent: customerHtml,
          senderEmail: brevoSender,
          senderName: 'Dkart Store',
          apiKey: brevoApiKey
        });
        console.log(`✅ [Brevo API] Order confirmation sent to customer: ${order.customer_email}`);
      }
      await sendViaBrevoApi({
        to: adminEmail,
        subject: `🚨 New Order Alert #${order.id} - Rs. ${orderTotal} (${order.customer_name})`,
        htmlContent: adminHtml,
        senderEmail: brevoSender,
        senderName: 'Dkart Store Alert',
        apiKey: brevoApiKey
      });
      console.log(`✅ [Brevo API] Executive order alert sent to Admin: ${adminEmail}`);
      return { success: true, provider: 'brevo-api' };
    }

    // MODE 2: Resend REST API
    if (resendApiKey) {
      console.log('⚡ Dispatching emails via Resend HTTPS API...');
      if (order.customer_email && order.customer_email.includes('@')) {
        await sendViaResendApi({
          to: order.customer_email,
          subject: `Order Confirmation #${order.id} - Dkart.pk`,
          html: customerHtml,
          apiKey: resendApiKey
        });
        console.log(`✅ [Resend API] Order confirmation sent to customer: ${order.customer_email}`);
      }
      await sendViaResendApi({
        to: adminEmail,
        subject: `🚨 New Order Alert #${order.id} - Rs. ${orderTotal} (${order.customer_name})`,
        html: adminHtml,
        apiKey: resendApiKey
      });
      console.log(`✅ [Resend API] Executive order alert sent to Admin: ${adminEmail}`);
      return { success: true, provider: 'resend-api' };
    }

    // MODE 3: Nodemailer (Gmail / Custom SMTP with IPv4)
    const client = getTransporter();
    if (!client) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 [EMAIL DISPATCH LOG — SMTP SIMULATION]');
      console.log(`To Customer: ${order.customer_email || order.customer_name}`);
      console.log(`To Admin: ${adminEmail}`);
      console.log(`Order ID: #${order.id} | COD Amount: Rs. ${orderTotal}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { success: true, simulated: true };
    }

    // 1. Send Email to Customer if email is provided
    if (order.customer_email && order.customer_email.includes('@')) {
      await client.sendMail({
        from: sender,
        to: order.customer_email,
        subject: `Order Confirmation #${order.id} - Dkart.pk`,
        html: customerHtml
      });
      console.log(`✅ [SMTP] Order confirmation email sent to customer: ${order.customer_email}`);
    }

    // 2. Send Alert Email to Admin
    await client.sendMail({
      from: sender,
      to: adminEmail,
      subject: `🚨 New Order Alert #${order.id} - Rs. ${orderTotal} (${order.customer_name})`,
      html: adminHtml
    });
    console.log(`✅ [SMTP] New order alert email sent to Admin: ${adminEmail}`);

    return { success: true, provider: 'smtp' };
  } catch (error) {
    console.error('❌ Email dispatch error (non-fatal):', error.message);
    return { success: false, error: error.message };
  }
}
