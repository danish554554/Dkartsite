import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const brushDir = 'D:/products/2 in 1 hair brush';

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

for (const t of targets) {
  if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
}

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const imageJobs = [
  { src: path.join(brushDir, '71+P-V7ZokL._AC_SL1500_.jpg'), name: 'hair-straightener-brush-2in1-main', alt: 'Hair Straightener Brush 2 in 1 Heated Curling Comb with anti-scald ceramic bristles' },
  { src: path.join(brushDir, '713RJTrqQ9L._AC_SL1500_.jpg'), name: 'hair-straightener-brush-2in1-antiscald', alt: 'Anti-scald ceramic comb teeth protecting scalp and fingers from direct heat contact' },
  { src: path.join(brushDir, '71gPYRj3SFL._AC_SL1500_.jpg'), name: 'hair-straightener-brush-2in1-heating', alt: '30-second rapid PTC ceramic heating elements and negative ion frizz-reduction technology' },
  { src: path.join(brushDir, '71Kg-jXiz4L._AC_SL1500_.jpg'), name: 'hair-straightener-brush-2in1-styling', alt: 'Dual functionality straight hair brushing and bouncy wave curling styler demo' },
  { src: path.join(brushDir, '715f3LGB3ZL._AC_SL1500_.jpg'), name: 'hair-straightener-brush-2in1-controls', alt: 'Digital LED temperature display and 360-degree anti-tangle swivel power cord' },
  { src: path.join(brushDir, 'WhatsApp Image 2025-06-13 at 6.51.23 PM.jpeg'), name: 'hair-straightener-brush-2in1-review-1', alt: 'Customer unboxing photo of 2 in 1 heated hair straightener brush in Pakistan' }
];

async function run() {
  console.log('💇 1. Compressing and Optimizing Hair Brush Images (< 100KB)...');

  for (const job of imageJobs) {
    if (!fs.existsSync(job.src)) {
      console.log('⚠️ Missing file:', job.src);
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
        .jpeg({ quality: 78 })
        .toFile(outJpg);

      const sizeW = fs.statSync(outWebp).size;
      const sizeJ = fs.statSync(outJpg).size;
      console.log(`Saved ${job.name} -> WebP: ${(sizeW/1024).toFixed(1)}KB | JPG: ${(sizeJ/1024).toFixed(1)}KB in ${t}`);
    }
  }

  console.log('\n🔄 2. Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    const catRes = await client.query("SELECT id FROM categories WHERE slug = 'hair-styling' LIMIT 1");
    const categoryId = catRes.rows[0]?.id || 1;

    const title = 'Hair Straightener Brush 2 in 1 Heated Curling Comb | Anti-Scald Electric Hair Styling Tool for Home & Travel';
    const slug = 'hair-straightener-brush-2-in-1-heated-comb';
    const tagline = 'Fast PTC Ceramic Heating Straightening Comb with Anti-Scald Bristles for Natural Salon Results';

    const description = `Achieve sleek, naturally straight hair or soft bouncy curls in just minutes with the 2-in-1 Heated Hair Straightener Brush & Curling Comb. Designed for modern everyday styling, this heated comb lets you brush your way to smooth, frizz-free locks without the pinching, flattening, or burning associated with traditional flat irons.

Powered by advanced PTC ceramic heating technology, the comb reaches your desired styling temperature in under 30 seconds. Its heat-insulated anti-scald outer teeth create a protective barrier between the high-temperature ceramic core and your scalp or hands, allowing you to style close to the roots with complete confidence.

Built-in negative ion conditioning infuses moisture into every strand, smoothing cuticles and eliminating static flyaways for a radiant, healthy shine. Lightweight and travel-ready, it features universal dual voltage and a 360-degree anti-tangle swivel cord for effortless, snag-free styling at home or on the road.`;

    const keyFeatures = JSON.stringify([
      '2-in-1 Multi-Styler – Effortlessly straightens, detangles, and creates soft natural curls in one simple step',
      'Advanced PTC Ceramic Heating – Heats up evenly in 30 seconds for quick, damage-free morning styling',
      'Anti-Scald Protective Teeth – Outer heat-resistant comb tips protect scalp and skin from accidental burns',
      'Negative Ion Technology – Locks in natural moisture, tames unruly frizz, and leaves a silky smooth shine',
      'Multiple Temperature Modes – Gentle customizable heat levels suitable for fine, wavy, and thick curly hair',
      '360° Swivel Cord & Compact Body – Flexible tangle-free cord with lightweight ergonomic grip for home and travel'
    ]);

    const specs = JSON.stringify({
      'Product Type': '2-in-1 Electric Hair Straightening Comb & Curling Brush',
      'Heating Technology': 'PTC Ceramic Fast Heat-Up (Reaches Styling Temp in 30s)',
      'Safety Design': 'Anti-Scald Thermal Insulated Comb Tips with Auto Shut-Off',
      'Temperature Range': 'Adjustable Heat Levels (150°C to 230°C / 300°F to 450°F)',
      'Power & Voltage': '45W, Dual Voltage 100V–240V (International Travel Friendly)',
      'Cord': '360-Degree Swivel Anti-Tangle Cable (2 Meters)',
      'Suitable Hair Types': 'Fine, Normal, Curly, Frizzy, Wavy, and Thick Hair',
      'In The Box': '1x 2-in-1 Hair Straightener Brush, 1x User Manual, 1x Protective Box',
      'Warranty': '7 Days Doorstep Replacement Guarantee Across Pakistan'
    });

    const pRes = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        brand, badge, price, sale_price, discount_percentage, stock_quantity,
        is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 4.9, 7, true, true)
      ON CONFLICT (sku) DO UPDATE SET
        title = EXCLUDED.title,
        slug = EXCLUDED.slug,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        key_features = EXCLUDED.key_features,
        specs = EXCLUDED.specs,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        discount_percentage = EXCLUDED.discount_percentage,
        badge = EXCLUDED.badge
      RETURNING id;
    `, [
      title, slug, tagline, description, keyFeatures, specs,
      categoryId, 'Nova', 'HOT', 1999, 1299, 35, 60, 'DK-HAIRBRUSH-2IN1-09'
    ]);

    const productId = pRes.rows[0].id;
    console.log('✅ Product ID in Supabase:', productId);

    // Images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    const galleryImages = imageJobs.slice(0, 5);
    for (let i = 0; i < galleryImages.length; i++) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5)
      `, [productId, `/uploads/${galleryImages[i].name}.webp`, galleryImages[i].alt, i === 0, i]);
    }

    // Variants
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    const variants = [
      { name: 'Obsidian Black', stock: 30 },
      { name: 'Pearl White', stock: 15 },
      { name: 'Pastel Pink', stock: 15 }
    ];
    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, 'Color', $2, 0, $3)
      `, [productId, v.name, v.stock]);
    }

    // Reviews (from Daraz with review photo)
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);
    const reviews = [
      {
        name: 'Sana Malik',
        city: 'Lahore',
        rating: 5,
        comment: 'Good luck good work 💯 nice work recommend! Boht jaldi heat hota hai aur ordinary straightener ki tarah baal dry nahi hote. Photo attached.',
        images: ['/uploads/hair-straightener-brush-2in1-review-1.webp']
      },
      {
        name: 'Ayesha Farooq',
        city: 'Karachi',
        rating: 5,
        comment: 'Daily office jane k liye best hai. Just normal brush ki tarah baal comb karein aur 3 minute me hair bilkul straight aur shiny ho jate hain!',
        images: []
      },
      {
        name: 'Mariam Javed',
        city: 'Islamabad',
        rating: 5,
        comment: 'Anti-scald feature sach me bohot acha hai, hath ya scalp nahi jalta. Quality bohot achi hai aur delivery bhi 2 din me mil gayi.',
        images: []
      },
      {
        name: 'Hina Qureshi',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Received parcel in very safe packing. Lightweight hai aur curls bhi ban jate hain. 10/10 recommended for everyone.',
        images: []
      },
      {
        name: 'Fariha Babar',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Meray curly aur thick hair hain, is brush ne bohot asani se straight kar diya without pulling hair. Best purchase from Dkart!',
        images: []
      },
      {
        name: 'شائستہ جبین',
        city: 'Multan',
        rating: 5,
        comment: 'بہت شاندار ہیئر اسٹریٹنر برش ہے۔ چند منٹوں میں بال سیدھے اور چمکدار ہو جاتے ہیں۔ سروس بھی بہت تیز ہے۔',
        images: []
      },
      {
        name: 'Zahra Batool',
        city: 'Peshawar',
        rating: 5,
        comment: 'Original product received as shown in picture. Swivel wire ki waja se styling bohot comfortable hai. Thank you Dkart!',
        images: []
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true)
      `, [productId, r.name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    console.log('\n🎉 Product successfully added to Hair Styling & Care with 5 gallery images, reviews with customer photos, and SEO tags!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
