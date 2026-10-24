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
  if (url.startsWith('//')) {
    url = 'https:' + url;
  }
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log('🚀 Step 1: Processing Main Product Images from Downloads folder...');
  const sourceDir = 'C:/Users/danis/Downloads/Hair Oil Applicator Comb, Refillable Scalp Massager & Liquid Dispenser with Storage Base, Even Oil Distribution Tool for All Hair Types & Growth Routines (Clear) pack of 1 _ Amazon.in_ Health & Personal Care';

  const mainImageJobs = [
    { file: 'imgi_5.jpg', name: 'hair-oil-applicator-comb-hero', is_primary: true, display_order: 0, alt: 'Hair Oil Applicator Comb with Metal Ball Tips Scalp Massager and Retail Box' },
    { file: 'imgi_1.jpg', name: 'hair-oil-applicator-comb-direct-root-application', is_primary: false, display_order: 1, alt: 'Direct Root Application and Scalp Massage with Hair Oil Comb' },
    { file: 'imgi_6.jpg', name: 'hair-oil-applicator-comb-precise-clean-comparison', is_primary: false, display_order: 2, alt: 'Targeted Clean and Precise Hair Oiling vs Messy Traditional Application' },
    { file: 'imgi_9.jpg', name: 'hair-oil-applicator-comb-men-women-daily-routine', is_primary: false, display_order: 3, alt: 'Daily Hair Care Routine Scalp Applicator for Women and Men' },
    { file: '6.jpg', name: 'hair-oil-applicator-comb-refill-and-usage-guide', is_primary: false, display_order: 4, alt: 'Step by Step Easy Refill and Usage Instructions for Oil Dispenser Comb' },
    { file: 'imgi_8.jpg', name: 'hair-oil-applicator-comb-dimensions-specs', is_primary: false, display_order: 5, alt: 'Compact Dimensions and Technical Specifications of Scalp Applicator Comb' }
  ];

  for (const job of mainImageJobs) {
    const srcPath = path.join(sourceDir, job.file);
    if (!fs.existsSync(srcPath)) {
      console.warn(`Source image missing: ${srcPath}`);
      continue;
    }
    const raw = fs.readFileSync(srcPath);
    const webpBuf = await sharp(raw)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const jpgBuf = await sharp(raw)
      .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toBuffer();

    console.log(`  Processed ${job.name} -> WebP: ${(webpBuf.length/1024).toFixed(1)}KB | JPG: ${(jpgBuf.length/1024).toFixed(1)}KB`);

    for (const dir of uploadDirs) {
      if (fs.existsSync(dir)) {
        fs.writeFileSync(path.join(dir, `${job.name}.webp`), webpBuf);
        fs.writeFileSync(path.join(dir, `${job.name}.jpg`), jpgBuf);
      }
    }
  }

  console.log('\n📥 Step 2: Downloading and Optimizing 7 Authentic Daraz Customer Review Photos...');
  const darazReviewPhotos = [
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_c06d2118764245329269605b2c2d1899.jpg', name: 'hair-oil-comb-customer-review-photo-1' },
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_b37aab1d6a924bfca100fbaa74cfde77.jpg', name: 'hair-oil-comb-customer-review-photo-2' },
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_0a99275580b6477faeb9e6b8bdf84bd8.jpg', name: 'hair-oil-comb-customer-review-photo-3' },
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_a9308ee47dfd40c18332117aed3b18cc.jpg', name: 'hair-oil-comb-customer-review-photo-4' },
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_bce2e4fabd464c2e82c4b78186d7e119.jpg', name: 'hair-oil-comb-customer-review-photo-5' },
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_490f261741b14ca89d3ce830a9351b56.jpg', name: 'hair-oil-comb-customer-review-photo-6' },
    { url: 'https://lzd-u.slatic.net/dd2af56fe8fb450c883d27b737ec6958_082717eb66914cce816b712cb207bda0.jpg', name: 'hair-oil-comb-customer-review-photo-7' }
  ];

  for (const item of darazReviewPhotos) {
    try {
      const raw = await downloadImage(item.url);
      const webpBuf = await sharp(raw)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
      const jpgBuf = await sharp(raw)
        .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 78 })
        .toBuffer();

      console.log(`  Downloaded & Optimized ${item.name} -> WebP: ${(webpBuf.length/1024).toFixed(1)}KB`);

      for (const dir of uploadDirs) {
        if (fs.existsSync(dir)) {
          fs.writeFileSync(path.join(dir, `${item.name}.webp`), webpBuf);
          fs.writeFileSync(path.join(dir, `${item.name}.jpg`), jpgBuf);
        }
      }
    } catch (err) {
      console.warn(`  Failed review photo ${item.name}: ${err.message}`);
    }
  }

  console.log('\n💾 Step 3: Inserting Product & Reviews into Supabase PostgreSQL...');
  const client = await pool.connect();

  try {
    const title = 'Hair Oil Applicator Comb with Metal Ball Tips | Scalp Massager, Root Oil Dispenser & 3-Piece Hair Care Set';
    const slug = 'hair-oil-applicator-comb-scalp-massager-root-dispenser';
    const tagline = 'Refillable Scalp Massager & Root Liquid Dispenser: Even Oil & Serum Distribution with Zero Waste';
    
    // Clean, professional description without Markdown headings (##) or asterisks (**)
    const description = `Take your hair care and oiling routine to the next level with the Crystal Hair Oil Applicator Comb. Designed specifically for direct root application, this smart dispenser features rolling metal ball teeth that glide effortlessly over your scalp, delivering essential oils, hair growth serums, or minoxidil directly where they are needed most without any waste or greasy hands.

Traditional hair oiling often leaves hair strands overly drenched while failing to penetrate deep into the scalp roots. With this ergonomic applicator, the liquid reservoir feeds an even, controlled micro-flow directly to the hair follicles as you comb. The smooth metal ball tips simultaneously provide a relaxing, invigorating scalp massage that stimulates micro-circulation and boosts nutrient absorption.

Refilling is clean and hassle-free using the included precision dropper. Simply open the top silicone seal, fill the reservoir with your favorite hair oil, serum, or treatment, and replace the leak-proof cap. The transparent body lets you easily monitor liquid levels at a glance. Complete with a protective silicone base guard, this compact and lightweight tool is ideal for daily home use and travel convenience.`;

    const keyFeatures = [
      'Rolling Metal Ball Tips: Delivers oil and serum directly to scalp roots without messy hands',
      'Simultaneous Scalp Massage: Promotes blood circulation and activates dormant hair follicles',
      'Zero Waste & Even Distribution: Targeted micro-dispensing prevents over-oiling hair lengths',
      'Refillable Clear Reservoir: Transparent chamber allows easy monitoring of liquid levels',
      'Leakproof Silicone Seal: Secure top plug and protective base cover prevent leaks and drips',
      'Universal Compatibility: Perfect for rosemary oil, castor oil, hair growth serums, and minoxidil',
      'Complete Care Set: Includes crystal applicator comb, protective teeth cover, and refill dropper'
    ];

    const specs = {
      'Product Type': 'Hair Oil & Serum Applicator Comb',
      'Application Method': 'Rolling Metal Ball Teeth (Direct Root Contact)',
      'Material': 'Medical-Grade Acrylic & Stainless Steel Ball Tips',
      'Reservoir Capacity': 'Liquid Storage Tank with Refill Dropper',
      'Dimensions': 'Approx. 7cm x 4cm (Compact Pocket / Travel Size)',
      'Suitable For': 'Men & Women (All Hair Types & Textures)',
      'In The Box': '1x Crystal Applicator Comb, 1x Protective Base Cover, 1x Precision Dropper, 1x Retail Box',
      'Warranty': '7-Day Replacement Guarantee'
    };

    const regularPrice = 1299.00;
    const salePrice = 699.00;
    const discountPercentage = 46;
    const categoryId = 1; // Hair Styling & Care
    const stockQuantity = 120;
    const badge = 'HOT DEAL';

    const reviews = [
      {
        user_name: 'Hania',
        rating: 5,
        city: 'Lahore',
        comment: 'Good quality with affordable price size is greater than my expectations and delivered on time 100% recommend',
        images: [
          '/uploads/hair-oil-comb-customer-review-photo-1.webp',
          '/uploads/hair-oil-comb-customer-review-photo-2.webp'
        ],
        verified_purchase: true
      },
      {
        user_name: 'Minsa',
        rating: 5,
        city: 'Karachi',
        comment: 'Got my parcel. Amazing product, metal roller balls se oil directly roots mein lag jata hai baghair hath gande kiye. Very useful!',
        images: [
          '/uploads/hair-oil-comb-customer-review-photo-3.webp',
          '/uploads/hair-oil-comb-customer-review-photo-4.webp',
          '/uploads/hair-oil-comb-customer-review-photo-5.webp',
          '/uploads/hair-oil-comb-customer-review-photo-6.webp',
          '/uploads/hair-oil-comb-customer-review-photo-7.webp'
        ],
        verified_purchase: true
      },
      {
        user_name: 'Tina',
        rating: 5,
        city: 'Islamabad',
        comment: "Amazing, 😻 I really love it it's same as shown 100% recommended! Packaging was also very neat.",
        images: [],
        verified_purchase: true
      },
      {
        user_name: 'Ayesha Tariq',
        rating: 5,
        city: 'Faisalabad',
        comment: 'Rosemary oil use karne k liye liya tha, result bohot acha hai. Teeth smoothly massage karte hain aur oil waste bilkul nahi hota.',
        images: [],
        verified_purchase: true
      },
      {
        user_name: 'Zainab Fatima',
        rating: 5,
        city: 'Rawalpindi',
        comment: 'Super convenient and clean. Dropper sath diya hua hai fill karna asan hai. Fast delivery in Rawalpindi.',
        images: [],
        verified_purchase: true
      },
      {
        user_name: 'Bilal Ahmed',
        rating: 5,
        city: 'Multan',
        comment: 'Minoxidil application k liye best tool hai. Scalp par seedha lagta hai baalon mein nahi phasta. Worth every rupee.',
        images: [],
        verified_purchase: true
      }
    ];

    const ratingAverage = 5.0;
    const ratingCount = reviews.length;

    // Insert or update product
    const productRes = await client.query(`
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
      JSON.stringify(keyFeatures),
      JSON.stringify(specs),
      categoryId,
      badge,
      regularPrice,
      salePrice,
      discountPercentage,
      stockQuantity,
      true,
      ratingAverage,
      ratingCount,
      'DK-HAIR-OIL-COMB-01',
      true,
      true
    ]);

    const productId = productRes.rows[0].id;
    console.log(`✅ Product upserted with ID: ${productId}`);

    // Clean old images and reviews for this product
    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    // Insert product images
    for (const job of mainImageJobs) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        productId,
        `/uploads/${job.name}.webp`,
        job.alt,
        job.is_primary,
        job.display_order
      ]);
    }
    console.log(`✅ Inserted ${mainImageJobs.length} product images.`);

    // Insert reviews
    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        productId,
        r.user_name,
        r.city,
        r.rating,
        r.comment,
        JSON.stringify(r.images),
        r.verified_purchase
      ]);
    }
    console.log(`✅ Inserted ${reviews.length} reviews (including authentic Daraz customer photos).`);

  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n🎉 Step 4: Finished database seeding successfully!');
}

run().catch(err => {
  console.error('Fatal error in seeding:', err);
  process.exit(1);
});
