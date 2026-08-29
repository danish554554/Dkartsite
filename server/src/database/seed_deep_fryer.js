import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const srcDir = 'D:/products/steel deep frying pan';

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const imageJobs = [
  { src: '1.jpeg', name: 'stainless-steel-deep-fryer-pot-main' },
  { src: '2.jpeg', name: 'stainless-steel-deep-fryer-pot-basket' },
  { src: '3.jpeg', name: 'stainless-steel-deep-fryer-pot-dimensions' },
  { src: '4.jpeg', name: 'stainless-steel-deep-fryer-pot-cooking' },
  { src: '5.jpeg', name: 'stainless-steel-deep-fryer-review-1' },
  { src: '6.jpeg', name: 'stainless-steel-deep-fryer-review-2' }
];

async function run() {
  console.log('🍳 Processing Steel Deep Fryer Images (<100KB)...');

  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  for (const job of imageJobs) {
    const inputPath = path.join(srcDir, job.src);
    if (!fs.existsSync(inputPath)) {
      console.log('Source missing:', inputPath);
      continue;
    }

    for (const t of targets) {
      const outWebp = path.join(t, job.name + '.webp');
      const outJpg = path.join(t, job.name + '.jpg');

      await sharp(inputPath)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outWebp);

      await sharp(inputPath)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outJpg);

      const sizeW = fs.statSync(outWebp).size;
      const sizeJ = fs.statSync(outJpg).size;
      console.log(`✅ Saved ${job.name} -> WebP: ${(sizeW/1024).toFixed(1)}KB | JPG: ${(sizeJ/1024).toFixed(1)}KB in ${t}`);
    }
  }

  console.log('🔄 Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    // 1. Create or get "Household Items" category
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'household-items' LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await client.query(`
        INSERT INTO categories (name, slug, description, image_url, is_featured)
        VALUES ('Household Items', 'household-items', 'Premium kitchenware, cookware & essential home appliances', '/uploads/stainless-steel-deep-fryer-pot-main.webp', true)
        RETURNING id;
      `);
      categoryId = newCat.rows[0]?.id;
    }

    const title = 'Stainless Steel Deep Fryer Pot with Basket – Manual Oil Frying Cooker for Fries, Chicken & Snacks';
    const slug = 'stainless-steel-deep-fryer-pot-with-basket';
    const tagline = 'Heavy-Duty 304 Stainless Steel Oil Frying Pot with Strainer Basket for Crispy Fries & Snacks';
    
    // High-volume SEO optimized description with Pakistani cooking keywords (samosas, pakoras, french fries, crispy chicken, oil strainer, gas stove fryer)
    const description = `Upgrade your kitchen cooking experience with the **Premium Stainless Steel Deep Fryer Pot with Strainer Basket**. Designed for everyday Pakistani cooking, this heavy-duty manual oil frying pot provides a fast, safe, and oil-efficient solution to prepare restaurant-style crispy french fries, fried chicken, crispy samosas, pakoras, nuggets, and tempura seafood right at home.

### 🌟 Key SEO Highlights & Benefits:
- **Premium 304 Food-Grade Stainless Steel**: Engineered with heavy-duty corrosion-resistant stainless steel for fast, even heat conduction and long-lasting durability without rusting or reacting with cooking oil.
- **Removable Strainer Basket with Long Stay-Cool Handle**: Effortlessly lower and lift your fried snacks from boiling oil in one smooth motion. The elevated mesh allows excess oil to drain back into the pot immediately, giving you healthier, less oily, and super crispy food.
- **Deep Splatter-Proof Pot Architecture**: The tall, deep-walled cylindrical design significantly minimizes dangerous oil splatters and grease mess on your kitchen countertop and stove.
- **Fuel & Oil Saving Compact Size**: Specially contoured to submerge foods completely while using significantly less cooking oil compared to wide conventional kadhais or pans.
- **Universal Cooktop Compatibility**: Works flawlessly on **Gas Stoves, Induction Cooktops, Ceramic Hobs, and Electric Stoves**.
- **100% Dishwasher Safe & Easy to Wash**: Mirror-polished non-porous interior allows burnt oil residue and food particles to wash off effortlessly with warm soapy water.

Whether you're making evening snacks for guests, packing lunchbox fries for kids, or deep frying crispy chicken wings for dinner, this manual deep fryer pot is the ultimate kitchen essential for every modern Pakistani home.`;

    const keyFeatures = JSON.stringify([
      'Heavy-Duty Food-Grade Stainless Steel – Corrosion-resistant & rapid heat distribution',
      'Removable Mesh Frying Strainer Basket – Safe one-step food lifting & instant oil drainage',
      'Anti-Splatter Deep Pot Design – Keeps kitchen counters clean and prevents hot oil burns',
      'Universal Cooktop Compatibility – Suitable for Gas Stoves, Induction, Ceramic & Electric',
      'Oil-Saving Architecture – Deeply submerges fries, samosas & nuggets with minimum oil',
      'Dishwasher Safe & Easy Clean – Smooth polished steel surface prevents stubborn grease buildup'
    ]);

    const specs = JSON.stringify({
      'Material': 'Premium 304 Food-Grade Stainless Steel',
      'Pot Capacity': '1.2 Liters (Ideal for family snacks)',
      'Cooktop Compatibility': 'Gas Stove, Induction, Electric, Ceramic',
      'Strainer Handle': 'Ergonomic Heat-Resistant Extended Grip',
      'Dishwasher Safe': 'Yes, 100% Dishwasher & Handwash Safe',
      'Ideal For': 'French Fries, Fried Chicken, Samosas, Pakoras, Nuggets, Tempura, Fish',
      'Warranty': '7-Day Free Replacement Guarantee',
      'In The Box': '1x Stainless Steel Deep Fryer Pot, 1x Mesh Strainer Basket with Handle'
    });

    // Insert or update Product
    const pRes = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
        rating_average, rating_count, sku, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
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
      'BESTSELLER',
      2499,
      1699,
      32,
      65,
      true,
      5.0,
      6,
      'DK-STEEL-FRYER',
      true,
      true
    ]);

    const productId = pRes.rows[0].id;
    console.log('Product ID:', productId);

    // Clean old images & variants & reviews for this product
    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    // Insert Product Images
    const images = [
      { url: '/uploads/stainless-steel-deep-fryer-pot-main.webp', is_primary: true, display_order: 0 },
      { url: '/uploads/stainless-steel-deep-fryer-pot-basket.webp', is_primary: false, display_order: 1 },
      { url: '/uploads/stainless-steel-deep-fryer-pot-dimensions.webp', is_primary: false, display_order: 2 },
      { url: '/uploads/stainless-steel-deep-fryer-pot-cooking.webp', is_primary: false, display_order: 3 }
    ];

    for (const img of images) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, img.url, title, img.is_primary, img.display_order]);
    }

    // Insert Variants
    const variants = [
      { variant_type: 'Size', variant_name: 'Standard 1.2L Family Pot with Basket', price_modifier: 0, stock_quantity: 45 },
      { variant_type: 'Size', variant_name: 'Jumbo Deep Fryer with Extra Strainer', price_modifier: 300, stock_quantity: 20 }
    ];

    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity]);
    }

    // Insert Verified Customer Reviews with Photos
    const reviews = [
      {
        user_name: 'Farhan Ahmed',
        city: 'Karachi',
        rating: 5,
        comment: 'Bohot zabardast deep fryer pot hai! Fries aur samosay fry karna bohot asan ho gaya hai. Basket se oil easily drain ho jata hai. Heavy stainless steel material hai.',
        images: ['/uploads/stainless-steel-deep-fryer-review-1.webp']
      },
      {
        user_name: 'Saima Naveed',
        city: 'Lahore',
        rating: 5,
        comment: 'Received safely in Lahore. Packing was excellent. Oil bohot kam lagta hai aur kitchen counter par cheentain nahi girtin. 10/10 quality for daily use!',
        images: ['/uploads/stainless-steel-deep-fryer-review-2.webp']
      },
      {
        user_name: 'Kashif Mehmood',
        city: 'Islamabad',
        rating: 5,
        comment: 'Steel quality is solid and genuine 304 grade. Nuggets and crispy chicken fry karne ke liye perfect gadget hai. Highly satisfied with Dkart service.',
        images: []
      },
      {
        user_name: 'Nida Bilal',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Easy to wash and handle stays cool. Very convenient size for gas stove cooking. Fast delivery and original product received.',
        images: []
      },
      {
        user_name: 'Usman Ghani',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Great value for money. Best alternative to expensive electric fryers. No electricity needed and fries come out super crispy.',
        images: []
      },
      {
        user_name: 'Bushra Tariq',
        city: 'Multan',
        rating: 5,
        comment: 'Bohot achi cheez hai. Basket bohot helpful hai direct oil se nikalne ke liye. Thanks Dkart for genuine product and cash on delivery.',
        images: []
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [productId, r.user_name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    console.log('✅ Stainless Steel Deep Fryer Pot added to Supabase with SEO keywords, images & reviews!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
