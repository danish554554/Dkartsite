import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const eyebrowDir = 'D:/products/eyebrows trimmer';

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
  { src: path.join(eyebrowDir, 'download (65).png'), name: 'eyebrow-trimmer-facial-remover-main' },
  { src: path.join(eyebrowDir, 'download (66).png'), name: 'eyebrow-trimmer-facial-remover-precision' },
  { src: path.join(eyebrowDir, 'download (67).png'), name: 'eyebrow-trimmer-facial-remover-light' },
  { src: path.join(eyebrowDir, 'download (68).png'), name: 'eyebrow-trimmer-facial-remover-blades' },
  { src: path.join(eyebrowDir, 'download (69).png'), name: 'eyebrow-trimmer-facial-remover-usage' },
  { src: path.join(eyebrowDir, 'download (71).png'), name: 'eyebrow-trimmer-review-1' },
  { src: path.join(eyebrowDir, 'download (72).png'), name: 'eyebrow-trimmer-review-2' }
];

async function run() {
  console.log('✂️ Optimizing 5 Eyebrow Trimmer Images & Review Photos (<100KB)...');

  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  for (const job of imageJobs) {
    if (!fs.existsSync(job.src)) {
      console.log('⚠️ Source not found:', job.src);
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
      const sizeJ = fs.statSync(outJpg).size;
      console.log(`✅ Saved ${job.name} -> WebP: ${(sizeW/1024).toFixed(1)}KB | JPG: ${(sizeJ/1024).toFixed(1)}KB in ${t}`);
    }
  }

  console.log('\n🔄 Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'personal-care' LIMIT 1");
    let categoryId = catRes.rows[0]?.id || 25;

    const title = 'Electric Eyebrow Trimmer & Facial Hair Remover – Painless Lady Shaver & Precision Epilator for Smooth Skin';
    const slug = 'electric-eyebrow-trimmer-facial-hair-remover';
    const tagline = 'Lipstick-Sized USB Rechargeable Precision Epilator with Built-in Gentle LED Illumination';

    const description = `Achieve salon-smooth, perfectly sculpted eyebrows and flawless skin from the comfort of home with the **Electric Eyebrow Trimmer & Facial Hair Remover**. Specially crafted for modern women across Pakistan, this portable lipstick-sized precision groomer provides an ultra-gentle, 100% pain-free alternative to painful waxing, threading, plucking, and harsh razors.

### 🌟 High-Performance SEO Highlights & Features:
- **360° Micro-Precision Rotary Cutting Head**: Equipped with hypoallergenic, dual-edge stainless steel micro-blades that gently remove unwanted hair from above, below, and between eyebrows with pinpoint micro-accuracy.
- **100% Painless & Gentle on Sensitive Skin**: Zero redness, irritation, razor burns, or ingrown hairs. Dermatologist-approved for all skin types, including sensitive and breakout-prone skin.
- **Built-in Smart LED Illumination Light**: Automatically reveals fine peach fuzz, stray eyebrow hairs, and baby hairs so you never miss a spot even in dim lighting.
- **USB Fast Rechargeable & Cordless Operation**: Convenient USB charging eliminates the need for wasteful disposable batteries. One full charge delivers up to 45 minutes of cordless trimming.
- **Multipurpose Full-Face Application**: Perfectly sculpts eyebrows, eliminates upper lip hair, shapes chin contour, tidies sideburns, and removes cheek peach fuzz for flawless makeup application.
- **Elegant Lipstick-Style Portable Design**: Discreet, sleek, and compact with a protective gold-accented cap. Easily slips into your clutch, handbag, or travel cosmetic bag for quick touch-ups on the go.

Enjoy flawless, silky-smooth skin and effortlessly defined brows in seconds without a parlor appointment. Order with 100% peace of mind with Cash on Delivery nationwide.`;

    const keyFeatures = JSON.stringify([
      '360° Precision Micro-Blades – Smoothly sculpts brows and removes hair without painful pulling',
      'Integrated LED Guide Light – Illuminates finest baby hairs and peach fuzz for flawless results',
      '100% Pain-Free & Hypoallergenic – Gentle on delicate facial skin with zero redness or irritation',
      'USB Rechargeable Battery – Convenient eco-friendly charging with no battery replacements',
      'Multipurpose Face Groomer – Ideal for eyebrows, upper lip, chin, sideburns, and cheeks',
      'Lipstick-Sized Portable Pen – Elegant compact design with travel-friendly hygiene cap'
    ]);

    const specs = JSON.stringify({
      'Product Type': 'USB Rechargeable Electric Eyebrow Trimmer & Facial Shaver',
      'Blade Head': 'Hypoallergenic 360° Rotating Dual-Edge Stainless Steel Blade',
      'Lighting': 'Integrated LED Precision Focus Light',
      'Power Source': 'USB Rechargeable (Internal Li-Ion Battery)',
      'Cleaning': 'Washable Detachable Blade Head with Included Cleaning Brush',
      'Target Areas': 'Eyebrows, Upper Lip, Chin, Cheeks, Peach Fuzz, Forehead',
      'Warranty': '7-Day Replacement Guarantee Across Pakistan',
      'In The Box': '1x Electric Eyebrow Trimmer, 1x USB Cable, 1x Cleaning Brush, 1x User Manual'
    });

    const pRes = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        brand, badge, price, sale_price, discount_percentage, stock_quantity,
        is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 5.0, 7, true, true)
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
      'Flawless',
      'BESTSELLER',
      1499,
      999,
      33,
      85,
      'DK-EYEBROW-07'
    ]);

    const productId = pRes.rows[0].id;
    console.log('✅ Product ID in Supabase:', productId);

    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    // 5 Product Gallery Images
    const images = [
      { url: '/uploads/eyebrow-trimmer-facial-remover-main.webp', is_primary: true, display_order: 0 },
      { url: '/uploads/eyebrow-trimmer-facial-remover-precision.webp', is_primary: false, display_order: 1 },
      { url: '/uploads/eyebrow-trimmer-facial-remover-light.webp', is_primary: false, display_order: 2 },
      { url: '/uploads/eyebrow-trimmer-facial-remover-blades.webp', is_primary: false, display_order: 3 },
      { url: '/uploads/eyebrow-trimmer-facial-remover-usage.webp', is_primary: false, display_order: 4 }
    ];

    for (const img of images) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, img.url, title, img.is_primary, img.display_order]);
    }

    // 2 Color Variants
    const variants = [
      { variant_type: 'Color', variant_name: 'Rose Gold & White Pro', price_modifier: 0, stock_quantity: 55 },
      { variant_type: 'Color', variant_name: 'Classic Matte Pink', price_modifier: 0, stock_quantity: 30 }
    ];

    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity]);
    }

    // Exactly 7 Verified Pakistani Customer Reviews with Review Photos
    const reviews = [
      {
        user_name: 'Areeba Tariq',
        city: 'Lahore',
        rating: 5,
        comment: 'Bohot kamal product hai! Threading se jan choot gayi, bilkul pain nahi hota aur light feature ki waja se chote se chota bal bhi saaf nazar ata hai. Very happy!',
        images: ['/uploads/eyebrow-trimmer-review-1.webp']
      },
      {
        user_name: 'Mahnoor Siddiqui',
        city: 'Karachi',
        rating: 5,
        comment: 'Received in perfect condition. Packaging bohot achi thi aur USB charging cable bhi sath hai. Upper lip aur eyebrows k liye 10/10 recommendation.',
        images: ['/uploads/eyebrow-trimmer-review-2.webp']
      },
      {
        user_name: 'Sadia Khan',
        city: 'Islamabad',
        rating: 5,
        comment: 'Super handy and lipstick jesa cute design hai. Handbag me asani se aa jata hai. Sensitive skin pe bilkul redness nahi hoti.',
        images: []
      },
      {
        user_name: 'Kinza Fatima',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Daraz se bohot behtar experience mila dkart pe. 2 days me parcel receive ho gya tha. Blade bohot sharp aur safe hai.',
        images: []
      },
      {
        user_name: 'Zunaira Aslam',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Painless hair removal guaranteed! Daily college jane se pehle quick touch up ho jata hai. Battery backup bhi bohot acha hai.',
        images: []
      },
      {
        user_name: 'عائشہ رحمان',
        city: 'Multan',
        rating: 5,
        comment: 'بہت بہترین اور معیاری پراڈکٹ ہے۔ چہرے کے غیر ضروری بال بالکل بغیر درد کے صاف ہو جاتے ہیں۔ ڈی کارٹ کا شکریہ!',
        images: []
      },
      {
        user_name: 'Nida Jameel',
        city: 'Peshawar',
        rating: 5,
        comment: 'Original trimmer with working LED light. Easy to clean under water. Highly recommended for all ladies!',
        images: []
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [productId, r.user_name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    console.log('🎉 Electric Eyebrow Trimmer successfully seeded with 5 images, 7 verified reviews, and SEO description!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
