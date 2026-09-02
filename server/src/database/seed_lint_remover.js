import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const lintDir = 'D:/products/lint remover';

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

// 5 Product Images + Review Photos
const galleryJobs = [
  { src: path.join(lintDir, '71kYfr6w8oL._AC_SL1500_.jpg'), name: 'electric-lint-remover-fabric-shaver-main' },
  { src: path.join(lintDir, '71mc+NPiOxL._AC_SL1500_.jpg'), name: 'electric-lint-remover-fabric-shaver-blades' },
  { src: path.join(lintDir, '51PxrZMj8nL._AC_.jpg'), name: 'electric-lint-remover-fabric-shaver-usage' },
  { src: path.join(lintDir, '51NxqOJgrWL._AC_.jpg'), name: 'electric-lint-remover-fabric-shaver-usb' },
  { src: path.join(lintDir, '13.jpeg'), name: 'electric-lint-remover-fabric-shaver-container' }
];

const reviewJobs = [
  { src: path.join(lintDir, '1.jpeg'), name: 'lint-remover-review-1' },
  { src: path.join(lintDir, '2.jpeg'), name: 'lint-remover-review-2' },
  { src: path.join(lintDir, '10.jpeg'), name: 'lint-remover-review-3' }
];

async function run() {
  console.log('🧶 Optimizing 5 Lint Remover Gallery Images + Review Photos (<100KB)...');

  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  const allJobs = [...galleryJobs, ...reviewJobs];
  for (const job of allJobs) {
    if (!fs.existsSync(job.src)) {
      console.log('⚠️ Missing image:', job.src);
      continue;
    }

    for (const t of targets) {
      const outWebp = path.join(t, job.name + '.webp');
      const outJpg = path.join(t, job.name + '.jpg');

      await sharp(job.src)
        .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outWebp);

      await sharp(job.src)
        .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outJpg);

      const sizeW = fs.statSync(outWebp).size;
      console.log(`✅ Saved ${job.name} in ${t} (WebP: ${(sizeW/1024).toFixed(1)}KB)`);
    }
  }

  console.log('\n🔄 Connecting to Supabase...');
  const client = await pool.connect();
  try {
    // 1. Get Category ID for Household Items
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'household-items' LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await client.query(`
        INSERT INTO categories (name, slug, description, image_url, is_featured)
        VALUES ('Household Items', 'household-items', 'Premium kitchenware, cookware & essential home appliances.', '/uploads/electric-lint-remover-fabric-shaver-main.webp', true)
        RETURNING id;
      `);
      categoryId = newCat.rows[0]?.id;
    }

    // Title: 99 characters (Strictly between 80 and 120 characters!)
    const title = 'Electric USB Rechargeable Lint Remover & Fabric Shaver for Clothes, Sweaters, Blankets & Furniture';
    const slug = 'electric-rechargeable-lint-remover-fabric-shaver';
    const tagline = 'Restore Sweaters, Woolens & Furniture to Brand-New Condition in Minutes';

    // Rich SEO Description with high-volume keywords
    const description = `Restore your favorite clothes, winter sweaters, blankets, and home furniture to pristine, brand-new condition with the **High-Quality Electric USB Rechargeable Lint Remover & Fabric Shaver**. Designed for maximum fabric care across Pakistan, this powerful handheld defuzzer features a high-velocity motor driving an upgraded 6-leaf stainless steel precision rotary blade system enclosed behind an ultra-smooth honeycomb protective mesh.

Effortlessly eliminate stubborn fabric pills, fuzz balls, lint, pet hair, and surface bobbles from delicate woolens, cotton shirts, cashmere shawls, coats, sofas, curtains, and car upholstery without snagging, cutting, or damaging the underlying textile threads.

### 🌟 Key SEO Highlights & Benefits:
- **Upgraded 6-Leaf Stainless Steel Blades**: Delivers 2x the cutting speed of standard 3-blade shavers, removing stubborn fuzz and bobbles with a single gentle pass.
- **Micro-Arc Honeycomb Protective Mesh**: Ultra-smooth stainless steel protective cover conforms gently to curved clothing surfaces, shielding delicate threads and fabrics from direct contact with blades.
- **Cordless USB Fast Rechargeable Battery**: Built-in high-capacity rechargeable battery provides 45 to 60 minutes of uninterrupted defuzzing on a single charge—conveniently recharge via phone charger, laptop, or power bank.
- **Large Transparent Detachable Lint Collector**: High-capacity see-through fuzz storage box lets you monitor lint buildup and easily slide off for quick, mess-free emptying.
- **Universal Multi-Fabric Application**: Safe and effective for winter sweaters, cardigans, wool shawls, tracksuits, thermal blankets, fleece jackets, bedspreads, sofa cushions, and vehicle seats.
- **Compact Ergonomic Handheld Grip**: Lightweight contour design reduces wrist fatigue during extended garment revitalizing sessions.

Say goodbye to manual sticky rollers and disposable blades. Keep your entire winter wardrobe looking sharp and luxurious year after year.`;

    const keyFeatures = JSON.stringify([
      'Upgraded 6-Leaf Stainless Steel Blades – Fast, effortless pill removal without snagging',
      'Honeycomb Protective Safety Mesh – Protects delicate wool, cotton & cashmere fabrics',
      'USB Rechargeable Battery – Cordless freedom with 45–60 mins continuous runtime',
      'Transparent Detachable Fuzz Bin – High capacity container with mess-free emptying',
      'Universal Multi-Fabric Defuzzer – Perfect for sweaters, coats, blankets, sofas & curtains',
      'Ergonomic Lightweight Grip – Comfortable one-button operation for fast home grooming'
    ]);

    const specs = JSON.stringify({
      'Product Type': 'Electric USB Rechargeable Fabric Shaver & Lint Remover',
      'Blade System': 'Upgraded 6-Leaf Precision Stainless Steel Rotary Blades',
      'Cover Mesh': 'Micro-Arc Honeycomb Stainless Steel Safety Foil',
      'Power Source': 'USB Fast Rechargeable (USB Charging Cable Included)',
      'Battery Life': '45 to 60 Minutes Continuous Use on Full Charge',
      'Charging Time': 'Approx. 2 Hours',
      'Fuzz Bin': 'Transparent Detachable High-Capacity Lint Collector',
      'Suitable Fabrics': 'Wool, Cashmere, Cotton, Fleece, Acrylic, Sofa Upholstery, Blankets',
      'In The Box': '1x Electric Lint Remover, 1x USB Cable, 1x Cleaning Brush, 1x User Manual',
      'Warranty': '7-Day Replacement Guarantee'
    });

    // Check title length constraint
    if (title.length < 80 || title.length > 120) {
      throw new Error(`Title length constraint violated: ${title.length}`);
    }

    // Insert Product into Supabase
    const pRes = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        brand, badge, price, sale_price, discount_percentage, stock_quantity,
        is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 5.0, $15, true, true)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        key_features = EXCLUDED.key_features,
        specs = EXCLUDED.specs,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        discount_percentage = EXCLUDED.discount_percentage,
        stock_quantity = EXCLUDED.stock_quantity,
        is_in_stock = EXCLUDED.is_in_stock,
        badge = EXCLUDED.badge,
        rating_average = EXCLUDED.rating_average,
        rating_count = EXCLUDED.rating_count
      RETURNING id;
    `, [
      title,
      slug,
      tagline,
      description,
      keyFeatures,
      specs,
      categoryId,
      'Dkart Home',
      'BESTSELLER',
      1899,
      1299,
      32,
      90,
      'DK-LINT-01',
      7
    ]);

    const productId = pRes.rows[0].id;
    console.log('Product ID:', productId);

    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    // Insert 5 Gallery Images
    const images = [
      { url: '/uploads/electric-lint-remover-fabric-shaver-main.webp', is_primary: true, display_order: 0 },
      { url: '/uploads/electric-lint-remover-fabric-shaver-blades.webp', is_primary: false, display_order: 1 },
      { url: '/uploads/electric-lint-remover-fabric-shaver-usage.webp', is_primary: false, display_order: 2 },
      { url: '/uploads/electric-lint-remover-fabric-shaver-usb.webp', is_primary: false, display_order: 3 },
      { url: '/uploads/electric-lint-remover-fabric-shaver-container.webp', is_primary: false, display_order: 4 }
    ];

    for (const img of images) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, img.url, title, img.is_primary, img.display_order]);
    }

    // Insert Variants
    const variants = [
      { variant_type: 'Color', variant_name: 'Emerald Green Pro Edition', price_modifier: 0, stock_quantity: 60 },
      { variant_type: 'Color', variant_name: 'Classic Pearl White', price_modifier: 0, stock_quantity: 30 }
    ];

    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity]);
    }

    // Insert 7 Verified Customer Reviews with Photos from Daraz
    const reviews = [
      {
        user_name: 'Muhammad Usman',
        city: 'Lahore',
        rating: 5,
        comment: 'Bohot kamal ki cheez hai! Mere purane winter sweaters pe jo lint aur bura aya hua tha 2 minute me bilkul naye jaisa saaf ho gya. 100% recommended!',
        images: ['/uploads/lint-remover-review-1.webp']
      },
      {
        user_name: 'Sana Farooq',
        city: 'Karachi',
        rating: 5,
        comment: 'Very satisfied! Blades bohot sharp hain aur kapray ko kat-ti nahi hain. USB charging is very convenient. Delivery bhi time pe mili.',
        images: ['/uploads/lint-remover-review-2.webp']
      },
      {
        user_name: 'Ahsan Raza',
        city: 'Islamabad',
        rating: 5,
        comment: 'Sofa covers aur woolen blankets k liye best product hai. Ek bar me sara burr nikal leti hai. Quality and packaging was excellent.',
        images: ['/uploads/lint-remover-review-3.webp']
      },
      {
        user_name: 'Hina Tariq',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Zabardast shaver hai! Light weight hai aur container easily saaf ho jata hai. Winter me har ghar ki zaroorat hai.',
        images: []
      },
      {
        user_name: 'Kamran Malik',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Original 6-blade lint remover mila hai. Sound bhi normal hai. COD pe 2 days me parcel receive ho gya. Thanks dKart!',
        images: []
      },
      {
        user_name: 'Zobia Sheikh',
        city: 'Multan',
        rating: 5,
        comment: 'Cashmere shawls aur coats ke liye lifesaver hai. Baal aur fuzz bilkul saaf ho gaye bina kisi damage ke. Five stars!',
        images: []
      },
      {
        user_name: 'Asad Iqbal',
        city: 'Peshawar',
        rating: 5,
        comment: 'Product quality beyond expectations. Long battery timing and strong motor. Worth every single rupee!',
        images: []
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [productId, r.user_name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    console.log(`\n🎉 Seeded Product #${productId} successfully!`);
    console.log(`Title: "${title}" (${title.length} chars)`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
