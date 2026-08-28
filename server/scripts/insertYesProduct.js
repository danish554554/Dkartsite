import { db, initDatabase } from '../src/database/db.js';

initDatabase();

const cat = db.prepare("SELECT id FROM categories WHERE slug = 'personal-care'").get();
const catId = cat ? cat.id : 2;

const title = 'Yes Finishing Rechargeable Hair Removal Shaver for Women – Facial, Bikini Line & Underarm Painless Electric Trimmer';
const slug = 'yes-finishing-hair-remover';
const tagline = 'Instant, pain-free hair removal with smart Sensalight technology for smooth, glowing skin anywhere, anytime.';
const description = `Say goodbye to painful waxing, razors, and expensive parlor treatments with the Yes Finishing Touch Instant & Painless Hair Remover. Engineered with advanced Sensa-Light Technology, the device automatically activates micro-oscillation only when in direct contact with skin, removing unwanted hair from roots without nicks, burns, redness, or bumps.

Designed specifically for women's delicate skin, it is ideal for full facial grooming (upper lips, chin, cheeks, sideburns), as well as sensitive body zones like underarms, arms, legs, and the bikini line. It features two interchangeable heads: a micro-foil head for short stubble and smooth finishing, and a trimmer head for longer hair.

The compact, USB rechargeable lithium-ion battery makes it travel-friendly and convenient for quick touch-ups on the go without requiring water, shaving cream, or soap.`;

const keyFeatures = JSON.stringify([
  'Smart Sensa-Light Technology: Automatically activates micro-vibration upon skin contact for safe, painless hair removal.',
  '100% Pain-Free & Gentle: No nicks, cuts, razor burns, redness, or irritation—dermatologist recommended for sensitive skin.',
  'Dual Interchangeable Heads: Includes a micro-foil head for ultra-close smooth finishing and a precision trimmer head for longer hair.',
  'Full Body & Facial Application: Perfect for upper lip, chin, peach fuzz, underarms, bikini line, arms, and legs.',
  'USB Rechargeable Battery: Built-in rechargeable Li-ion battery with included USB charging cable—no extra batteries needed.',
  'Built-in LED Illumination: Integrated light reveals even the finest peach fuzz so you never miss a spot.',
  'Compact & Portable: Elegant, lightweight pocket-sized design easily slips into your handbag or travel vanity pouch.',
  'Cash on Delivery Nationwide: 100% genuine product with 7-day replacement warranty and fast delivery across Pakistan.'
]);

const specs = JSON.stringify({
  'Product Name': 'Yes Finishing Touch Rechargeable Hair Remover',
  'Model': 'Yes Instant Pain-Free Shaver Pro',
  'Power Source': 'USB Rechargeable (Built-in Lithium-Ion Battery)',
  'Technology': 'Active Sensa-Light Contact Sensor',
  'Heads Included': '1x Micro-Foil Head + 1x Trimmer Head',
  'Cleaning': 'Washable Removable Heads with Included Cleaning Brush',
  'Charging Time': 'Approximately 2 Hours for up to 60 Minutes use',
  'In The Box': '1x Yes Hair Remover Unit, 1x Micro-Foil Head, 1x Trimmer Head, 1x USB Cable, 1x Cleaning Brush, 1x Manual'
});

db.prepare('DELETE FROM products WHERE slug = ?').run(slug);

const insertProd = db.prepare(`
  INSERT INTO products (
    title, slug, tagline, description, key_features, specs, category_id, brand,
    badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
    sku, rating_average, rating_count, is_featured, is_trending
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const info = insertProd.run(
  title, slug, tagline, description, keyFeatures, specs, catId, 'Yes Finishing Touch',
  'Bestseller', 2199, 1699, 23, 85, 1,
  'DK-YES-02', 5.0, 192, 1, 1
);

const productId = info.lastInsertRowid;
console.log('Inserted Yes product ID locally:', productId);

const insertImg = db.prepare(`
  INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
  VALUES (?, ?, ?, ?, ?)
`);

const images = [
  { url: '/uploads/yes-finishing-hair-remover-main.webp', alt: 'Yes Finishing Touch Hair Remover Main Device', isPrimary: 1, order: 1 },
  { url: '/uploads/yes-finishing-hair-remover-sensalight.webp', alt: 'Sensalight Technology Active Demonstration', isPrimary: 0, order: 2 },
  { url: '/uploads/yes-finishing-hair-remover-application.webp', alt: 'Facial and Body Application Areas', isPrimary: 0, order: 3 },
  { url: '/uploads/yes-finishing-hair-remover-heads.webp', alt: 'Dual Interchangeable Trimmer Heads', isPrimary: 0, order: 4 },
  { url: '/uploads/yes-finishing-hair-remover-packaging.webp', alt: 'Yes Finishing Touch Box Packaging', isPrimary: 0, order: 5 }
];

images.forEach(img => {
  insertImg.run(productId, img.url, img.alt, img.isPrimary, img.order);
});

const insertVar = db.prepare(`
  INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertVar.run(productId, 'color', 'White & Purple', 0, 85, '/uploads/yes-finishing-hair-remover-main.webp');

console.log('✅ Local Yes Finishing product inserted successfully!');
