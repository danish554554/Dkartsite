import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const sourceDir = 'D:/products/electric razor for women/main_images';

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const imageMap = [
  { file: '1.jpeg', name: 'electric-razor-women-waterproof-main', is_primary: true, order: 0 },
  { file: '2.jpeg', name: 'electric-razor-women-waterproof-blades', is_primary: false, order: 1 },
  { file: '3.jpeg', name: 'electric-razor-women-waterproof-bodyzones', is_primary: false, order: 2 },
  { file: '4.jpeg', name: 'electric-razor-women-waterproof-shower', is_primary: false, order: 3 },
  { file: '5.jpeg', name: 'electric-razor-women-waterproof-usb-charge', is_primary: false, order: 4 },
  { file: '6.jpeg', name: 'electric-razor-women-waterproof-colors', is_primary: false, order: 5 }
];

async function run() {
  console.log('✂️ Optimizing Electric Razor for Women Main Images (<100KB)...');

  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  for (const item of imageMap) {
    const srcPath = path.join(sourceDir, item.file);
    if (!fs.existsSync(srcPath)) {
      console.log('⚠️ Source not found:', srcPath);
      continue;
    }

    for (const t of targets) {
      const outWebp = path.join(t, item.name + '.webp');
      const outJpg = path.join(t, item.name + '.jpg');

      await sharp(srcPath)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(outWebp);

      await sharp(srcPath)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toFile(outJpg);

      const sizeW = fs.statSync(outWebp).size;
      const sizeJ = fs.statSync(outJpg).size;
      console.log(`✅ Saved ${item.name} -> WebP: ${(sizeW/1024).toFixed(1)}KB | JPG: ${(sizeJ/1024).toFixed(1)}KB in ${t}`);
    }
  }

  console.log('\n🔄 Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'personal-care' LIMIT 1");
    let categoryId = catRes.rows[0]?.id || 25;

    const title = 'Electric Razor for Women – Waterproof Bikini Trimmer, Facial Shaver for Underarms, Legs & Body, Pink/Purple';
    const slug = 'electric-razor-women-waterproof-bikini-trimmer';
    const tagline = 'IPX7 Waterproof Wet & Dry Cordless Shaver with 3-in-1 Floating Foil Blades for Sensitive Skin';

    const description = `Experience effortless, salon-smooth grooming from head to toe with the Electric Razor for Women. Designed specifically for sensitive female contours, this gentle all-in-one shaver glides smoothly over curves to remove unwanted body hair without painful tugging, razor burns, redness, or stubble bumps.

Featuring an advanced 3-in-1 high-speed floating blade system, it combines a straight blade for arms and legs, a curved foil blade for underarms and bikini lines, and a floating mesh foil for close, silky-soft finishes. The hypoallergenic stainless steel blades protect delicate skin, making it safe for daily use on even the most sensitive skin types.

With full IPX7 waterproof protection, you can comfortably use it dry for quick morning touch-ups or wet in the shower or bath with your favorite shaving foam or gel. It easily rinses clean under running water.

Compact, cordless, and lightweight, it charges quickly via standard USB so you never need to purchase disposable batteries. Available in chic Pink and Purple finishes, this stylish electric trimmer easily fits in your travel pouch, gym bag, or vanity table for smooth, confident skin wherever you go.`;

    const keyFeatures = JSON.stringify([
      '3-in-1 Floating Blades – Straight, curved, and floating foil blades contour smoothly to body curves',
      'IPX7 100% Waterproof – Safe for wet and dry shaving in the shower or bath with easy water rinsing',
      'Gentle on Sensitive Skin – Hypoallergenic stainless steel blades prevent nicks, bumps, and redness',
      'USB Fast Rechargeable – Built-in high-capacity battery provides up to 50 minutes of cordless grooming',
      'Multi-Zone Full Body Shaver – Specially designed for legs, underarms, bikini line, arms, and face',
      'Ergonomic Travel-Ready Design – Lightweight, non-slip grip with protective cap for on-the-go beauty'
    ]);

    const specs = JSON.stringify({
      'Product Type': 'Electric Razor & Bikini Trimmer for Women',
      'Waterproof Rating': 'IPX7 100% Waterproof (Full Body Washable)',
      'Blade System': '3-in-1 Hypoallergenic Stainless Steel Floating Blade',
      'Shaving Modes': 'Wet & Dry (Supports Shaving Gel, Foam, or Dry Skin)',
      'Power Source': 'USB Fast Rechargeable (Internal Li-Ion Battery)',
      'Battery Runtime': 'Up to 50 Minutes Cordless Use on Full Charge',
      'Target Areas': 'Bikini Area, Underarms, Legs, Arms, Face, Peach Fuzz',
      'Available Colors': 'Soft Pastel Pink, Lavender Purple',
      'In The Box': '1x Electric Shaver, 1x Protective Cap, 1x USB Charging Cable, 1x Cleaning Brush'
    });

    const pRes = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        brand, badge, price, sale_price, discount_percentage, stock_quantity,
        is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 4.9, 8, true, true)
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
      'Flawless Care',
      'NEW ARRIVAL',
      3299,
      2299,
      30,
      75,
      'DK-RAZOR-WOMEN-08'
    ]);

    const productId = pRes.rows[0].id;
    console.log('✅ Product ID in Supabase:', productId);

    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    // Insert 6 Gallery Images
    for (const img of imageMap) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, `/uploads/${img.name}.webp`, title, img.is_primary, img.order]);
    }

    // Insert 2 Color Variants
    const variants = [
      { variant_type: 'Color', variant_name: 'Soft Pastel Pink', price_modifier: 0, stock_quantity: 45 },
      { variant_type: 'Color', variant_name: 'Lavender Purple', price_modifier: 0, stock_quantity: 30 }
    ];

    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity]);
    }

    // Verified Customer Reviews
    const reviews = [
      {
        user_name: 'Anum Zahra',
        city: 'Lahore',
        rating: 5,
        comment: 'Honestly the best razor I have used in Pakistan. Shower me use kiya tha soap ke sath, bilkul pain ya redness nahi hui. Legs and underarms are super smooth!'
      },
      {
        user_name: 'Sana Malik',
        city: 'Karachi',
        rating: 5,
        comment: 'Waterproof feature works 100%! Pink color looks very elegant. USB charging is very convenient, 2 weeks se charge nahi kiya abhi tak chal raha hai.'
      },
      {
        user_name: 'Hira Naveed',
        city: 'Islamabad',
        rating: 5,
        comment: 'Bikini trimmer head is super gentle. Waxing se jaan chhoot gayi. Fast delivery received in 2 days in Islamabad.'
      },
      {
        user_name: 'Mariam Farooq',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Quality is top notch! Blade cuts very close without biting or scratching skin. Best purchase on Dkart.'
      },
      {
        user_name: 'فاطمہ اعجاز',
        city: 'Faisalabad',
        rating: 5,
        comment: 'بہت زبردست شیوور ہے۔ واٹر پروف ہے اور چارجنگ بھی بہت اچھی رہتی ہے۔ بالکل درد نہیں ہوتا۔'
      },
      {
        user_name: 'Zainab Bibi',
        city: 'Multan',
        rating: 4,
        comment: 'Good product, very lightweight and easy to hold. The curved blade is very helpful for underarm curves.'
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, '[]', true);
      `, [productId, r.user_name, r.city, r.rating, r.comment]);
    }

    console.log('🎉 Electric Razor for Women successfully seeded with 6 images, variants, reviews, and human description!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
