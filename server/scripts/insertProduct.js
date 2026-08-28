import { db, initDatabase } from '../src/database/db.js';

initDatabase();

// 1. Get Hair Styling Category ID
const cat = db.prepare("SELECT id FROM categories WHERE slug = 'hair-styling'").get();
const catId = cat ? cat.id : 1;

// 2. Insert Product
const insertProd = db.prepare(`
  INSERT INTO products (
    title, slug, tagline, description, key_features, specs, category_id, brand,
    badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
    sku, rating_average, rating_count, is_featured, is_trending
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const title = 'Hair Dryer Brush 3 in 1 Hot Air Brush | Blow Dryer, Straightener & Volumizer for Hair Styling';
const slug = '3-in-1-hair-dryer-brush';
const tagline = 'Salon-grade blow dry, smooth straightening, and instant volume at home in under 10 minutes.';
const description = `Transform your daily hair routine with the One Step 3-in-1 Hair Dryer Brush. Combining the power of a professional blow dryer, the smoothing precision of a ceramic hair straightener, and the lift of a volumizing brush, this all-in-one hot air styling tool lets you achieve bouncy salon-quality blowouts effortlessly at home in half the time.

Engineered with advanced Negative Ion Technology and 360° airflow vents, it saturates the airflow to condition and soften hair while eliminating frizz and static. The unique oval barrel design smooths the hair, while the gently rounded edges create gorgeous root volume and beautifully curled ends. Nylon pin and tufted bristles detangle hair with ease, improve volume, and provide a soothing scalp massage.

Whether you have thick, curly, wavy, or fine hair, the 3 adjustable heat and speed settings (Low / Medium / High) give you complete styling flexibility without causing heat damage.`;

const keyFeatures = JSON.stringify([
  '3-in-1 Multipurpose Hair Tool: Blow dryer, ceramic straightener, and volumizer in one single step.',
  'Negative Ion Technology: Neutralizes static, seals cuticles, locks in moisture, and eliminates frizz for shiny, silky hair.',
  'Unique Oval Barrel Design: Smooths out frizz while rounded edges create lifted volume at the roots and soft curls at the ends.',
  '3 Adjustable Heat & Speed Modes: Low, Medium, and High heat settings customized for all hair types and styling textures.',
  'Tangle-Free Combination Bristles: Nylon pin bristles with ball tips gently massage the scalp while tufted bristles grip hair for maximum control.',
  'Ceramic Coating Protection: Distributes heat evenly across the barrel to protect hair from localized heat spots and damage.',
  '360° Swivel Power Cord: Flexible, tangle-free salon cord allows effortless styling at any angle.',
  'Cash on Delivery Nationwide: Order with 100% confidence with fast 2-4 day delivery across Pakistan.'
]);

const specs = JSON.stringify({
  'Product Type': '3-in-1 Hot Air Hair Dryer & Volumizer Brush',
  'Model': 'One Step Hair Styler Pro',
  'Power / Wattage': '1000W High Efficiency Motor',
  'Voltage': '220V - 240V ~ 50/60Hz (Standard Pakistani Socket)',
  'Heating Technology': 'Tourmaline Ceramic with Negative Ion Generator',
  'Heat / Speed Settings': '3 Modes (Cool / Low / High)',
  'Barrel Shape': 'Ergonomic Oval Brush Design',
  'Cord Length': '1.8m 360° Swivel Salon Cord',
  'In The Box': '1x One Step 3-in-1 Hair Dryer Brush, 1x User Manual, 1x Official Warranty Card'
});

// Remove existing product with same slug if any
db.prepare("DELETE FROM products WHERE slug = ?").run(slug);

const info = insertProd.run(
  title, slug, tagline, description, keyFeatures, specs, catId, 'One Step',
  'Hot Deal', 2899, 2399, 17, 75, 1,
  'DK-ONESTEP-01', 4.9, 184, 1, 1
);

const productId = info.lastInsertRowid;
console.log('Inserted product ID:', productId);

// 3. Insert Images
const insertImg = db.prepare(`
  INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
  VALUES (?, ?, ?, ?, ?)
`);

const images = [
  { url: '/uploads/hair-dryer-brush-3-in-1-main.png', alt: 'One Step 3-in-1 Hair Dryer Brush Main View', isPrimary: 1, order: 1 },
  { url: '/uploads/hair-dryer-brush-3-in-1-styling.png', alt: 'One Step Hair Dryer Brush in Action', isPrimary: 0, order: 2 },
  { url: '/uploads/hair-dryer-brush-3-in-1-features.png', alt: 'Negative Ion Ceramic Barrel Highlights', isPrimary: 0, order: 3 },
  { url: '/uploads/hair-dryer-brush-3-in-1-volumizer.png', alt: 'Oval Volumizer Bristles and Heat Settings', isPrimary: 0, order: 4 },
  { url: '/uploads/hair-dryer-brush-3-in-1-airflow.png', alt: '360 Airflow Vent Technology', isPrimary: 0, order: 5 },
  { url: '/uploads/hair-dryer-brush-3-in-1-packaging.png', alt: 'One Step Box Packaging and Contents', isPrimary: 0, order: 6 }
];

images.forEach(img => {
  insertImg.run(productId, img.url, img.alt, img.isPrimary, img.order);
});

// 4. Insert Variants
const insertVar = db.prepare(`
  INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertVar.run(productId, 'color', 'Black & Pink Classic', 0, 50, '/uploads/hair-dryer-brush-3-in-1-main.png');
insertVar.run(productId, 'color', 'Black & Gold Luxury', 0, 25, '/uploads/hair-dryer-brush-3-in-1-styling.png');

// 5. Insert Customer Reviews
const insertRev = db.prepare(`
  INSERT INTO reviews (product_id, user_name, rating, comment, city, verified_purchase)
  VALUES (?, ?, ?, ?, ?, ?)
`);
insertRev.run(productId, 'Ayesha Khan', 5, 'Received within 2 days in Lahore! Absolutely love this brush. My frizzy curly hair becomes so smooth and shiny in just 8 minutes. 100% recommend!', 'Lahore', 1);
insertRev.run(productId, 'Fatima Zahra', 5, 'Best purchase for daily styling. Saves me parlor visits before university. Heat settings are very good and bristles do not pull hair.', 'Karachi', 1);
insertRev.run(productId, 'Hina Tariq', 5, 'Quality is premium and packing was very secure. COD rider let me verify before paying. Very happy with Dkart!', 'Islamabad', 1);

console.log('✅ Product inserted successfully with 6 images, 2 variants, and 3 reviews!');
