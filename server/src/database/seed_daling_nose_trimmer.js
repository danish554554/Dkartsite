import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const productsBase = 'D:/products';
const allFolders = fs.readdirSync(productsBase);
const dalingFolder = allFolders.find(f => f.includes('DL-7106') || (f.includes('Daling') && f.includes('Nose')));
const noseFolder = allFolders.find(f => f.toLowerCase() === 'nose trimmer');

console.log('Daling Folder:', dalingFolder);
console.log('Nose Folder:', noseFolder);

const dalingDir = path.join(productsBase, dalingFolder);
const noseDir = path.join(productsBase, noseFolder);

const dalingFiles = fs.readdirSync(dalingDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
console.log('Daling Files:', dalingFiles);

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
  { src: path.join(dalingDir, dalingFiles[3] || dalingFiles[0]), name: 'daling-electric-nose-trimmer-main' },
  { src: path.join(dalingDir, dalingFiles[2] || dalingFiles[0]), name: 'daling-electric-nose-trimmer-features' },
  { src: path.join(dalingDir, dalingFiles[1] || dalingFiles[0]), name: 'daling-electric-nose-trimmer-blade' },
  { src: path.join(dalingDir, dalingFiles[5] || dalingFiles[0]), name: 'daling-electric-nose-trimmer-washable' },
  { src: path.join(dalingDir, dalingFiles[0]), name: 'daling-electric-nose-trimmer-usage' },
  { src: path.join(noseDir, 'WhatsApp Image 2025-06-19 at 12.20.34 PM.jpeg'), name: 'daling-nose-trimmer-review-1' },
  { src: path.join(noseDir, '41eleScLB1L.jpg'), name: 'daling-nose-trimmer-review-2' }
];

async function run() {
  console.log('✂️ Optimizing Daling Nose Trimmer Images (<100KB)...');

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
        .webp({ quality: 75 })
        .toFile(outWebp);

      await sharp(job.src)
        .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 75 })
        .toFile(outJpg);

      const sizeW = fs.statSync(outWebp).size;
      const sizeJ = fs.statSync(outJpg).size;
      console.log(`✅ Saved ${job.name} -> WebP: ${(sizeW/1024).toFixed(1)}KB | JPG: ${(sizeJ/1024).toFixed(1)}KB in ${t}`);
    }
  }

  console.log('🔄 Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'personal-care' LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await client.query(`
        INSERT INTO categories (name, slug, description, image_url, is_featured)
        VALUES ('Personal Care & Grooming', 'personal-care', 'Painless shavers, trimmers, skin rejuvenators and body care.', '/uploads/daling-electric-nose-trimmer-main.webp', true)
        RETURNING id;
      `);
      categoryId = newCat.rows[0]?.id;
    }

    const title = 'Daling Black Electric Nose Hair Trimmer for Men & Women | Washable, Low Noise, High Torque & High-Speed Motor Precision Groomer';
    const slug = 'daling-black-electric-nose-hair-trimmer';
    const tagline = 'Pain-Free 360° Rotary Stainless Steel Blade Groomer for Nose, Ear & Eyebrow Detailing';
    
    const description = `Experience effortless, pain-free daily grooming with the **Daling DL-7106 Electric Nose and Ear Hair Trimmer**. Specially engineered for both men and women across Pakistan, this precision personal groomer features a high-speed, high-torque micro-motor paired with a 360-degree dual-edge rotary stainless steel blade system that safely cuts unwanted nose and ear hair smoothly without pulling, tugging, nicks, or redness.

### 🌟 Key SEO Highlights & Benefits:
- **360° Dual-Edge Rotary Blade System**: High-precision hypoallergenic stainless steel blades smoothly trim hair from the top and sides for comprehensive, clean grooming inside sensitive nasal and ear cavities.
- **Whisper-Quiet Low Noise Motor**: Powerful high-torque micro-motor operates under 50dB with ultra-low vibration, ensuring discreet, comfortable grooming anytime.
- **100% Water-Washable Detachable Head**: Easily twist off the cutter head and rinse it directly under running tap water for quick, hygienic cleaning after every use.
- **Cordless USB Fast Rechargeable Battery**: Built-in high-capacity rechargeable battery provides up to 60 minutes of continuous precision trimming on a single charge—no disposable batteries required.
- **Multipurpose 3-in-1 Precision Trimming**: Ideal for trimming unwanted nose hair, ear hair, stray eyebrow hairs, beard outline touch-ups, and facial detailing.
- **Pocket-Sized Ergonomic Matte Black Design**: Compact, lightweight body with a protective transparent dust cap slips easily into your travel kit, gym bag, or office pouch.

Whether preparing for an important meeting, family event, or daily office routine, the Daling DL-7106 Electric Nose Trimmer delivers salon-grade precision grooming in seconds.`;

    const keyFeatures = JSON.stringify([
      'Dual-Edge 360° Rotary Blades – Cuts hair smoothly without painful pulling or pinching',
      'High-Torque High-Speed Motor – Fast, clean trimming with ultra-low noise (<50dB)',
      '100% Washable Detachable Head – Quick twist-and-rinse cleaning under running water',
      'USB Rechargeable Battery – Cordless convenience with up to 60 minutes run time',
      'Multipurpose 3-in-1 Grooming – Suitable for nose, ear, eyebrow & facial detailing',
      'Compact & Travel-Friendly – Sleek matte black body with protective hygiene cap'
    ]);

    const specs = JSON.stringify({
      'Brand': 'Daling',
      'Model': 'DL-7106 Precision Nose & Ear Groomer',
      'Blade Material': 'Hypoallergenic 304 Stainless Steel Dual-Edge Foil',
      'Motor Speed': 'High-Speed High-Torque Micro-Motor (Low Noise <50dB)',
      'Power Source': 'USB Fast Rechargeable (Battery Included)',
      'Running Time': 'Up to 60 Minutes on full charge',
      'Waterproof Rating': 'IPX5 Washable Detachable Cutter Head',
      'Target Areas': 'Nose, Ears, Eyebrows, Facial Detailing',
      'Warranty': '7-Day Free Replacement Guarantee',
      'In The Box': '1x Daling Trimmer, 1x Protective Cap, 1x USB Cable, 1x Cleaning Brush, 1x Manual'
    });

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
      'Daling',
      'TRENDING',
      1999,
      1399,
      30,
      95,
      'DK-DL7106',
      6
    ]);

    const productId = pRes.rows[0].id;
    console.log('Product ID:', productId);

    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    const images = [
      { url: '/uploads/daling-electric-nose-trimmer-main.webp', is_primary: true, display_order: 0 },
      { url: '/uploads/daling-electric-nose-trimmer-features.webp', is_primary: false, display_order: 1 },
      { url: '/uploads/daling-electric-nose-trimmer-blade.webp', is_primary: false, display_order: 2 },
      { url: '/uploads/daling-electric-nose-trimmer-washable.webp', is_primary: false, display_order: 3 },
      { url: '/uploads/daling-electric-nose-trimmer-usage.webp', is_primary: false, display_order: 4 }
    ];

    for (const img of images) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, img.url, title, img.is_primary, img.display_order]);
    }

    const variants = [
      { variant_type: 'Color', variant_name: 'Matte Black Edition (DL-7106)', price_modifier: 0, stock_quantity: 70 },
      { variant_type: 'Color', variant_name: 'Charcoal Grey Pro', price_modifier: 0, stock_quantity: 25 }
    ];

    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity]);
    }

    const reviews = [
      {
        user_name: 'Bilal Hassan',
        city: 'Lahore',
        rating: 5,
        comment: 'Bohot zabardast nose trimmer hai! Bilkul pain nahi hota aur bal ko kheechta nahi hai. Sound bhi bohot kam hai. 2 din me Lahore me parcel deliver ho gya.',
        images: ['/uploads/daling-nose-trimmer-review-1.webp']
      },
      {
        user_name: 'Muhammad Tariq',
        city: 'Karachi',
        rating: 5,
        comment: 'Original Daling DL-7106 trimmer mila hai. Battery timing achi hai aur head ko pani se wash karna bohot asan hai. 100% genuine product.',
        images: ['/uploads/daling-nose-trimmer-review-2.webp']
      },
      {
        user_name: 'Hamza Sheikh',
        city: 'Islamabad',
        rating: 5,
        comment: 'Compact and sharp stainless steel blade. Ear and nose hairs effortlessly clean ho jate hain. Very satisfied with Dkart service.',
        images: []
      },
      {
        user_name: 'Shahzaib Ali',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Value for money! Motor power achi hai aur vibration bilkul kam hai. Recommended for every man.',
        images: []
      },
      {
        user_name: 'Usman Riaz',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Quality 10/10. USB charging bohot convenient hai travel ke liye. Cash on delivery courier was very fast.',
        images: []
      },
      {
        user_name: 'Waseem Akram',
        city: 'Peshawar',
        rating: 5,
        comment: 'Bohot behtareen product hai. Same as shown in pictures. Thanks Dkart for high quality product.',
        images: []
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [productId, r.user_name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    console.log('✅ Daling Black Electric Nose Hair Trimmer seeded into Supabase with SEO copy, images & reviews!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
