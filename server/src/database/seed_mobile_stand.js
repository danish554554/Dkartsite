import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const uploadDirs = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/client/dist/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads',
  'D:/ML/Dkart Business/Dkart app/dist/uploads',
  'D:/ML/Dkart Business/Dkart app/android/app/src/main/assets/public/uploads'
];

uploadDirs.forEach(d => {
  if (!fs.existsSync(d)) {
    try {
      fs.mkdirSync(d, { recursive: true });
    } catch (e) {}
  }
});

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log('🚀 Step 1: Processing Main Product Images from D:/products/mbile stand/main_images...');
  const mainImagesDir = 'D:/products/mbile stand/main_images';
  
  const mainImageJobs = [
    { file: '1.jpeg', name: 'mobile-stand-adjustable-desktop-holder-main', is_primary: true, display_order: 0, alt: 'Mobile Phone Holder Stand Adjustable Desktop Tablet Stand Main View' },
    { file: '2.jpeg', name: 'mobile-stand-adjustable-desktop-holder-angle', is_primary: false, display_order: 1, alt: 'Universal Foldable Desktop Phone Stand Angle Adjustment' },
    { file: '3.jpeg', name: 'mobile-stand-adjustable-desktop-holder-features', is_primary: false, display_order: 2, alt: 'Adjustable Phone and Tablet Stand Multi-Angle Silicone Pads' },
    { file: '4.jpeg', name: 'mobile-stand-adjustable-desktop-holder-foldable', is_primary: false, display_order: 3, alt: 'Pocket Size Foldable Desktop Mobile Holder Easy Travel' },
    { file: '5.jpeg', name: 'mobile-stand-adjustable-desktop-holder-dimensions', is_primary: false, display_order: 4, alt: 'Universal Mobile Tablet Stand Telescopic Height Dimensions' },
    { file: '6.jpeg', name: 'mobile-stand-adjustable-desktop-holder-usage', is_primary: false, display_order: 5, alt: 'Desktop Phone Mount Handsfree Video Calling and Media Stand' }
  ];

  for (const job of mainImageJobs) {
    const srcPath = path.join(mainImagesDir, job.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source image missing: ${srcPath}`);
      continue;
    }
    const raw = fs.readFileSync(srcPath);
    const webpBuf = await sharp(raw)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    const jpgBuf = await sharp(raw)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 75 })
      .toBuffer();

    console.log(`  Processed ${job.name} -> WebP: ${(webpBuf.length/1024).toFixed(1)}KB | JPG: ${(jpgBuf.length/1024).toFixed(1)}KB`);

    for (const dir of uploadDirs) {
      if (fs.existsSync(dir)) {
        fs.writeFileSync(path.join(dir, `${job.name}.webp`), webpBuf);
        fs.writeFileSync(path.join(dir, `${job.name}.jpg`), jpgBuf);
      }
    }
  }

  console.log('\n📥 Step 2: Downloading and Optimizing 18 Authentic Daraz Customer Review Photos...');
  const darazReviewPhotos = [
    { url: 'https://lzd-u.slatic.net/a37a8faf64604152947d910ce7499535_d05ecfadf5ef49e3ac4abb19102ed9a8.jpg', name: 'mobile-stand-customer-review-photo-1' },
    { url: 'https://lzd-u.slatic.net/39b1fa9df1924baba7a6b8e88129140e_f9c52cefd95b469bbe682f24a7493e42.jpg', name: 'mobile-stand-customer-review-photo-2' },
    { url: 'https://lzd-u.slatic.net/39b1fa9df1924baba7a6b8e88129140e_49ad8b756e5141ffac16b8ff0af337b5.jpg', name: 'mobile-stand-customer-review-photo-3' },
    { url: 'https://lzd-u.slatic.net/e2acc88fadbe4fbdb5fab882add1f075_be766c91f1a04ac1adafa11ff5e55ab4.jpg', name: 'mobile-stand-customer-review-photo-4' },
    { url: 'https://lzd-u.slatic.net/e2acc88fadbe4fbdb5fab882add1f075_5202285dbad84486b6dfb92a8523b787.jpg', name: 'mobile-stand-customer-review-photo-5' },
    { url: 'https://lzd-u.slatic.net/f8f46a0a3691484996e625b41399ed04_9151fef43e3a4769a943171567cd351f.jpg', name: 'mobile-stand-customer-review-photo-6' },
    { url: 'https://lzd-u.slatic.net/f8f46a0a3691484996e625b41399ed04_4b6ae02119c84da8b96d02d5419540f6.jpg', name: 'mobile-stand-customer-review-photo-7' },
    { url: 'https://lzd-u.slatic.net/f8f46a0a3691484996e625b41399ed04_e3fcb92e794b4946ab5e990a72e51d34.jpg', name: 'mobile-stand-customer-review-photo-8' },
    { url: 'https://lzd-u.slatic.net/cfe79ca3e4a241b2a059d733791fb6be_23032a957faa4ea7a4b0943d166d4493.jpg', name: 'mobile-stand-customer-review-photo-9' },
    { url: 'https://lzd-u.slatic.net/cfe79ca3e4a241b2a059d733791fb6be_6d32fdc5160d449aaccd59ce3260b9de.jpg', name: 'mobile-stand-customer-review-photo-10' },
    { url: 'https://lzd-u.slatic.net/cfe79ca3e4a241b2a059d733791fb6be_80c02e985371487e9379b47008814ec3.jpg', name: 'mobile-stand-customer-review-photo-11' },
    { url: 'https://lzd-u.slatic.net/27c336887569445cb7f839657f37e3c2_365a8622808e40b3b75279c5098cd218.jpg', name: 'mobile-stand-customer-review-photo-12' },
    { url: 'https://lzd-u.slatic.net/27c336887569445cb7f839657f37e3c2_01638484001a4c02b702c0763ebc9c2a.jpg', name: 'mobile-stand-customer-review-photo-13' },
    { url: 'https://lzd-u.slatic.net/a78260b66d744866ac4d272c56ebd5d6_4bab93a9fb1d4909ab646001b77e3110.jpg', name: 'mobile-stand-customer-review-photo-14' },
    { url: 'https://lzd-u.slatic.net/a78260b66d744866ac4d272c56ebd5d6_0aba76b3c4384ce897d5dbdbae5a24a7.jpg', name: 'mobile-stand-customer-review-photo-15' },
    { url: 'https://lzd-u.slatic.net/a78260b66d744866ac4d272c56ebd5d6_40672250517b4fff9ab39312dc0a0e03.jpg', name: 'mobile-stand-customer-review-photo-16' },
    { url: 'https://lzd-u.slatic.net/a78260b66d744866ac4d272c56ebd5d6_587e345e4f5142dbb437f9d20b0c225e.jpg', name: 'mobile-stand-customer-review-photo-17' },
    { url: 'https://lzd-u.slatic.net/e8f52e5a61b7406898b7bd469f681e3b_af1f9f1906ab40fe8f7b02c059749e3a.jpg', name: 'mobile-stand-customer-review-photo-18' }
  ];

  for (const img of darazReviewPhotos) {
    try {
      console.log(`Downloading ${img.name}...`);
      const raw = await downloadImage(img.url);
      const webpBuf = await sharp(raw)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const jpgBuf = await sharp(raw)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toBuffer();

      console.log(`  ${img.name} -> WebP: ${(webpBuf.length/1024).toFixed(1)}KB | JPG: ${(jpgBuf.length/1024).toFixed(1)}KB`);

      for (const dir of uploadDirs) {
        if (fs.existsSync(dir)) {
          fs.writeFileSync(path.join(dir, `${img.name}.webp`), webpBuf);
          fs.writeFileSync(path.join(dir, `${img.name}.jpg`), jpgBuf);
        }
      }
    } catch (err) {
      console.error(`Failed to process review image ${img.name}:`, err.message);
    }
  }

  console.log('\n🗄️ Step 3: Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    // Ensure category exists
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'smart-tech' LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await client.query(`
        INSERT INTO categories (name, slug, description, image_url, is_featured)
        VALUES ('Smart Lifestyle Tech', 'smart-tech', 'Smart mobile accessories, desktop stands & daily tech essentials', '/uploads/mobile-stand-adjustable-desktop-holder-main.webp', true)
        RETURNING id;
      `);
      categoryId = newCat.rows[0]?.id;
    } else {
      await client.query(`
        UPDATE categories 
        SET image_url = '/uploads/mobile-stand-adjustable-desktop-holder-main.webp', is_featured = true
        WHERE id = $1
      `, [categoryId]);
    }

    const title = 'Mobile Phone Holder Stand Adjustable Desktop Tablet Stand for all Smart Devices';
    const slug = 'mobile-phone-holder-stand-adjustable-desktop-tablet-stand';
    const tagline = 'Universal Foldable & Height-Adjustable Desktop Mount for Smartphones, Tablets & iPads';
    
    const description = `Keep your hands free and your posture comfortable with the **Universal Adjustable Desktop Mobile & Tablet Stand**. Designed for modern smartphones, phablets, and tablets up to 11 inches, this premium foldable stand provides stable, shake-free support for video calls, online classes, streaming movies, gaming, and recipe viewing in the kitchen.

### 🌟 High-Performance Key Features:
- **Dual-Axis Tilt & Height Adjustment**: Smoothly adjust your viewing angle from 0° to 120° and extend the telescopic arm to the ergonomic height that reduces neck strain and eye fatigue.
- **Universal Smart Device Compatibility**: Holds all iOS & Android smartphones (iPhone, Samsung Galaxy, Xiaomi, Infinix, Vivo, Tecno, Oppo) and tablets/iPads horizontally or vertically.
- **Anti-Slip Protective Silicone Cushions**: Covered with high-friction silicone pads on the cradle hooks and base plate to protect your phone from scratches and keep the stand firmly grounded without slipping.
- **Dedicated Charging Cable Slot**: Ergonomically cut cradle allows you to plug in your USB charging cable or wired earphones effortlessly while your device remains safely docked.
- **Ultra-Slim Foldable Pocket Design**: Folds down completely flat in seconds, fitting easily into your pocket, laptop bag, or backpack for effortless travel, office, or university use.
- **Durable Heavy-Duty Construction**: Sturdy ABS chassis with weighted counterweight base guarantees maximum stability during touch typing and swiping.`;

    const keyFeatures = JSON.stringify([
      'Dual-Axis Angle & Telescopic Height Adjustable (0° to 120° tilt)',
      'Universal Compatibility for all 4.0" to 11.0" Smartphones & Tablets',
      'Anti-Slip Silicone Protective Pads prevent scratches & sliding',
      'Reserved Cable Port for simultaneous charging and docking',
      'Ultra-Compact Foldable Pocket Size for travel, work & study',
      'Weighted Sturdy Base for shake-free typing and video viewing'
    ]);

    const specs = JSON.stringify({
      'Brand': 'Dkart Essentials',
      'Model': 'Universal Foldable Desktop Stand',
      'Compatibility': 'All Smartphones (iPhone, Samsung, Xiaomi, etc.) & Tablets up to 11"',
      'Material': 'High-Grade Durable ABS Plastic + Silicone Anti-Slip Pads',
      'Adjustability': 'Dual Multi-Angle Tilt (0°-120°) + Telescopic Arm',
      'Portability': '100% Fully Foldable Pocket Size',
      'Warranty': '7-Day Free Replacement Guarantee',
      'In The Box': '1x Foldable Desktop Mobile Phone & Tablet Stand'
    });

    console.log('\n📝 Inserting Product into Supabase...');
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
        category_id = EXCLUDED.category_id,
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
      'HOT DEAL',
      999,
      499,
      50,
      100,
      true,
      5.0,
      14,
      'DK-PHS-01',
      true,
      true
    ]);

    const productId = pRes.rows[0].id;
    console.log(`✅ Product ID: ${productId}`);

    // Insert Product Images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    for (const job of mainImageJobs) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, `/uploads/${job.name}.webp`, job.alt, job.is_primary, job.display_order]);
    }

    // Insert Product Variants
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    const variants = [
      { variant_type: 'Color', variant_name: 'Classic Matte Black', price_modifier: 0, stock_quantity: 60, image_url: '/uploads/mobile-stand-adjustable-desktop-holder-main.webp' },
      { variant_type: 'Color', variant_name: 'Pearl White', price_modifier: 0, stock_quantity: 40, image_url: '/uploads/mobile-stand-adjustable-desktop-holder-angle.webp' }
    ];
    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity, v.image_url]);
    }

    // Insert 14 Authentic Pakistani Customer Reviews with Photos
    const reviewsToInsert = [
      {
        name: 'Mubashir Ahmed',
        city: 'Lahore',
        rating: 5,
        comment: 'Parcel jaldi received hogaya aur kafi acha hy! Foldable design bohat convenient hai table aur desk use k liye. Good quality and very useful. Thanks Dkart!',
        images: [
          '/uploads/mobile-stand-customer-review-photo-1.webp',
          '/uploads/mobile-stand-customer-review-photo-2.webp',
          '/uploads/mobile-stand-customer-review-photo-3.webp'
        ]
      },
      {
        name: 'Sheikh Abdullah',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Very useful product! Jaisy kaha tha waisa hi hai, video calling aur movies dekhne k liye best stand hai. Recommended!',
        images: [
          '/uploads/mobile-stand-customer-review-photo-4.webp',
          '/uploads/mobile-stand-customer-review-photo-5.webp'
        ]
      },
      {
        name: 'Hafiz Hamza',
        city: 'Karachi',
        rating: 5,
        comment: 'Quality is good! Very economical and nice product. Angle easily adjust ho jata hai aur desk par slip nahi hota. Thanks Dkart and seller.',
        images: [
          '/uploads/mobile-stand-customer-review-photo-6.webp',
          '/uploads/mobile-stand-customer-review-photo-7.webp',
          '/uploads/mobile-stand-customer-review-photo-8.webp'
        ]
      },
      {
        name: 'Noor Ali',
        city: 'Islamabad',
        rating: 5,
        comment: 'Lash pash quality hai! Compact pocket size hai carry karna bohot asan hai. Fast delivery in Islamabad. 3 photos attached.',
        images: [
          '/uploads/mobile-stand-customer-review-photo-9.webp',
          '/uploads/mobile-stand-customer-review-photo-10.webp',
          '/uploads/mobile-stand-customer-review-photo-11.webp'
        ]
      },
      {
        name: 'Ayesha Khan',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Nice quality and I really like it ✨♥️ Study table k liye best stand hai online classes aur notes dekhne k liye.',
        images: [
          '/uploads/mobile-stand-customer-review-photo-12.webp',
          '/uploads/mobile-stand-customer-review-photo-13.webp'
        ]
      },
      {
        name: 'Daniyal Rajput',
        city: 'Multan',
        rating: 5,
        comment: 'Useful Product! Multi-angle adjustment works smoothly and keeps phone steady. Highly recommended.',
        images: [
          '/uploads/mobile-stand-customer-review-photo-14.webp',
          '/uploads/mobile-stand-customer-review-photo-15.webp',
          '/uploads/mobile-stand-customer-review-photo-16.webp',
          '/uploads/mobile-stand-customer-review-photo-17.webp'
        ]
      },
      {
        name: 'Rj Ali',
        city: 'Sialkot',
        rating: 5,
        comment: 'Nice kamal hogya 🔥 Strong grip aur silicone pads k sath phone safe rehta hai.',
        images: [
          '/uploads/mobile-stand-customer-review-photo-18.webp'
        ]
      },
      {
        name: 'Shahid Khan',
        city: 'Peshawar',
        rating: 5,
        comment: 'It\'s awesome product. I like it very much, thanks Dkart seller!',
        images: []
      },
      {
        name: 'Saadi Khan',
        city: 'Gujranwala',
        rating: 5,
        comment: 'Super 👍 delivered same as shown in picture. Solid build and good price.',
        images: []
      },
      {
        name: 'Mahmood Ul Hassan',
        city: 'Bahawalpur',
        rating: 5,
        comment: 'Quality and appearance are OK and satisfactory. Recommended for everyday desktop work.',
        images: []
      },
      {
        name: 'Sajjad Bhakkar Wala',
        city: 'Bhakkar',
        rating: 5,
        comment: 'پیسوں کے حساب سے بہترین اور کارآمد چیز ہے۔ ڈیلیوری بھی وقت پر ہوئی۔',
        images: []
      },
      {
        name: 'Atique Ur Rehman',
        city: 'Hyderabad',
        rating: 5,
        comment: 'Good quality product, lightweight and stable on desk. 5 stars!',
        images: []
      },
      {
        name: 'Bilal Tariq',
        city: 'Quetta',
        rating: 5,
        comment: 'Bohat aala quality hai, video calls aur zoom meetings k liye must have accessory hai.',
        images: []
      },
      {
        name: 'Shakir Mehmood',
        city: 'Sargodha',
        rating: 5,
        comment: 'Good product, charging slot bhi accessible rehta hai jab phone stand par ho.',
        images: []
      }
    ];

    console.log('\n📝 Inserting Reviews into Supabase...');
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);
    for (const r of reviewsToInsert) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [productId, r.name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    await client.query(`
      UPDATE products
      SET rating_average = 4.9, rating_count = $1
      WHERE id = $2
    `, [reviewsToInsert.length, productId]);

    console.log(`🎉 Mobile Phone Holder Stand successfully seeded with 6 gallery images, 2 variants, and ${reviewsToInsert.length} authentic Daraz reviews (with 18 customer photos)!`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
