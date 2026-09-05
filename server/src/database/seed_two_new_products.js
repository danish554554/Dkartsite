import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

for (const t of targets) {
  if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
}

// 1. Process Electric Razor For Women Images
const razorDir = 'D:/products/electric razor for women/main_images';
const razorImages = [
  { src: path.join(razorDir, '1.jpeg'), name: 'electric-razor-women-waterproof-main' },
  { src: path.join(razorDir, '2.jpeg'), name: 'electric-razor-women-waterproof-blades' },
  { src: path.join(razorDir, '3.jpeg'), name: 'electric-razor-women-waterproof-bikini' },
  { src: path.join(razorDir, '4.jpeg'), name: 'electric-razor-women-waterproof-washable' },
  { src: path.join(razorDir, '5.jpeg'), name: 'electric-razor-women-waterproof-ergonomic' }
];

// 2. Process Foot Callus Remover Images
const footDir = 'D:/products/foot scraperss';
const footImages = [
  { src: path.join(footDir, 'download.png'), name: 'electric-foot-callus-remover-main' },
  { src: path.join(footDir, 'download (1).png'), name: 'electric-foot-callus-remover-rollers' },
  { src: path.join(footDir, 'download (2).png'), name: 'electric-foot-callus-remover-results' },
  { src: path.join(footDir, 'download (3).png'), name: 'electric-foot-callus-remover-features' },
  { src: path.join(footDir, 'download (7).png'), name: 'electric-foot-callus-remover-charging' }
];

async function compressImage(src, baseName) {
  for (const t of targets) {
    const outWebp = path.join(t, baseName + '.webp');
    const outJpg = path.join(t, baseName + '.jpg');

    await sharp(src)
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outWebp);

    await sharp(src)
      .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 78 })
      .toFile(outJpg);

    const sizeW = fs.statSync(outWebp).size;
    const sizeJ = fs.statSync(outJpg).size;
    console.log(`Saved ${baseName} in ${t} (WebP: ${(sizeW/1024).toFixed(1)}KB, JPG: ${(sizeJ/1024).toFixed(1)}KB)`);
  }
}

async function run() {
  console.log('🖼️ 1. Processing Electric Razor for Women Images...');
  for (const img of razorImages) {
    if (fs.existsSync(img.src)) {
      await compressImage(img.src, img.name);
    } else {
      console.log('Missing:', img.src);
    }
  }

  console.log('\n🦶 2. Processing Foot Callus Remover Images...');
  for (const img of footImages) {
    if (fs.existsSync(img.src)) {
      await compressImage(img.src, img.name);
    } else {
      console.log('Missing:', img.src);
    }
  }

  console.log('\n🔄 3. Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  try {
    const catRes = await client.query("SELECT id FROM categories WHERE slug = 'personal-care' LIMIT 1");
    const categoryId = catRes.rows[0]?.id || 25;

    // ==========================================
    // SEED PRODUCT 1: Electric Razor for Women
    // ==========================================
    const razorTitle = 'Electric Razor for Women – Waterproof Bikini Trimmer, Facial Shaver for Underarms, Legs & Body, Pink/Purple';
    const razorSlug = 'electric-razor-women-waterproof-bikini-trimmer';
    const razorTagline = 'Gentle Wet & Dry Cordless Shaver with Hypoallergenic Floating Foil for Silky-Smooth Skin';

    const razorDesc = `Experience effortless, silky-smooth skin from head to toe with this Waterproof Electric Razor and Body Shaver for Women. Designed specifically for delicate skin, this versatile grooming tool lets you trim and shave unwanted hair without razor bumps, irritation, ingrown hairs, or cuts.

Featuring hypoallergenic 3-in-1 curved stainless steel blades and a floating foil head, it smoothly follows the natural curves of your legs, underarms, bikini area, and peach fuzz. Whether you prefer a quick dry touch-up before heading out or a soothing wet shave in the shower, its fully waterproof body is ready whenever you are.

The lightweight, ergonomic handle gives you complete control in either hand, and the rechargeable battery eliminates the hassle of disposable batteries. After grooming, simply rinse the shaver head directly under running water for easy, hygienic maintenance.`;

    const razorFeatures = JSON.stringify([
      '3-in-1 Precision Blades – Curved and straight blades with central foil for all body areas',
      '100% Waterproof Body – Safe and comfortable for both wet shower use and quick dry shaves',
      'Hypoallergenic Foil – Gentle on sensitive skin with zero razor bumps, redness, or burning',
      'USB Rechargeable – Long-lasting cordless battery with convenient USB charging',
      'Ergonomic Grip – Lightweight, easy-to-maneuver design for bikini line and underarms',
      'Washable Head – Detachable blade head rinses clean under tap water in seconds'
    ]);

    const razorSpecs = JSON.stringify({
      'Product Type': 'Cordless Electric Body Shaver & Bikini Trimmer for Women',
      'Blade Material': 'Hypoallergenic Stainless Steel 3-in-1 Floating Foil',
      'Waterproof Rating': 'IPX7 Fully Washable (Wet & Dry Safe)',
      'Power Source': 'USB Rechargeable Lithium Battery',
      'Charging Time': 'Approx. 2 Hours (Up to 50 Minutes Cordless Runtime)',
      'Suitable For': 'Bikini Area, Underarms, Legs, Arms, Facial Peach Fuzz',
      'In The Box': '1x Shaver Unit, 1x Trimming Guard, 1x USB Cable, 1x Cleaning Brush',
      'Warranty': '7 Days Replacement Guarantee'
    });

    const p1Res = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        brand, badge, price, sale_price, discount_percentage, stock_quantity,
        is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 5.0, 6, true, true)
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
      razorTitle, razorSlug, razorTagline, razorDesc, razorFeatures, razorSpecs,
      categoryId, 'Flawless', 'NEW', 1999, 1499, 25, 65, 'DK-RAZOR-WOMEN-08'
    ]);
    const p1Id = p1Res.rows[0].id;
    console.log('✅ Electric Razor Product ID:', p1Id);

    // Razor Images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [p1Id]);
    for (let i = 0; i < razorImages.length; i++) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5)
      `, [p1Id, `/uploads/${razorImages[i].name}.webp`, razorTitle, i === 0, i]);
    }

    // Razor Variants
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [p1Id]);
    const razorVariants = [
      { name: 'Soft Pink', stock: 35 },
      { name: 'Lavender Purple', stock: 30 }
    ];
    for (const v of razorVariants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, 'Color', $2, 0, $3)
      `, [p1Id, v.name, v.stock]);
    }

    // Razor Reviews
    await client.query('DELETE FROM reviews WHERE product_id = $1', [p1Id]);
    const razorReviews = [
      { name: 'Hira Salman', city: 'Karachi', rating: 5, comment: 'Bohot soft aur smooth shave karta hai. Bikini area pe bilkul cut ya irritation nahi hui. Highly satisfied!' },
      { name: 'Marium Naveed', city: 'Lahore', rating: 5, comment: 'Shower me use kiya, waterproof feature 100% genuine hai. Battery bhi kaafi arsa chalti hai.' },
      { name: 'Fatima Bilal', city: 'Islamabad', rating: 5, comment: 'Colors bohot pretty hain. Pink shade order kiya tha, exact same aya. 2 days me delivery mil gayi thi.' },
      { name: 'Ayesha Siddiqui', city: 'Rawalpindi', rating: 5, comment: 'Painless hair removal guaranteed. Waxing ki takleef se chutkara mil gaya. Must buy for every woman!' },
      { name: 'Zoya Khan', city: 'Peshawar', rating: 5, comment: 'Original quality body trimmer. Cleaning brush aur cable sath aati hai. Very good packaging.' },
      { name: 'فرح نورین', city: 'Multan', rating: 5, comment: 'بہت عمدہ پراڈکٹ ہے۔ حساس جلد کے لیے بہترین شیور ہے۔ شکریہ ڈی کارٹ!' }
    ];
    for (const r of razorReviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, '[]', true)
      `, [p1Id, r.name, r.city, r.rating, r.comment]);
    }

    // ==========================================
    // SEED PRODUCT 2: Electric Foot Callus Remover
    // ==========================================
    const footTitle = 'Electric Foot Callus Remover – Rechargeable Pedicure Tool with LED Light & Interchangeable Grinding Heads';
    const footSlug = 'electric-foot-callus-remover-pedicure-tool';
    const footTagline = 'Salon-Grade Rechargeable Pedicure Buffer for Cracked Heels, Rough Skin & Stubborn Calluses';

    const footDesc = `Restore rough, cracked heels and dry feet to baby-soft smoothness in minutes with the Electric Foot Callus Remover. This rechargeable pedicure tool gently buffs away thick dead skin, stubborn calluses, and dry patches without harsh scraping or razor blades.

Equipped with a powerful high-torque motor and dual-speed controls, it offers a gentle mode for daily maintenance and an intensive mode for tough, thickened heels. The built-in focused LED light illuminates every contour of your foot so you never miss a rough spot.

With interchangeable mineral grinding roller heads (fine, medium, and coarse), you can easily customize your foot spa routine at home. Its ergonomic curved body fits naturally in your hand, and the USB rechargeable battery ensures you always have power ready for your next soothing foot pampering session.`;

    const footFeatures = JSON.stringify([
      'Dual-Speed Powerful Motor – Gentle 1700 RPM mode and intensive 2000 RPM mode for all skin types',
      'Interchangeable Grinding Heads – Includes fine, regular, and coarse rollers for tailored smoothing',
      'Built-in Focused LED Light – Clearly illuminates cracks, rough spots, and heels for precision care',
      'USB Rechargeable Battery – Quick USB charging gives up to 90 minutes of continuous pedicure care',
      'Safe Pressure-Stop Sensor – Automatically pauses if pressed too hard to protect healthy skin',
      'Washable Roller Heads – Detaches with one press to rinse clean under water for hygienic reuse'
    ]);

    const footSpecs = JSON.stringify({
      'Product Type': 'Cordless Electric Foot Callus Remover & Pedicure Shaver',
      'Grinding Rollers': 'Micro-Mineral Quartz Crystals (Fine, Medium, Coarse)',
      'Speed Levels': '2 Adjustable Speeds (Low for Daily Care, High for Tough Calluses)',
      'Lighting': 'Built-in Precision LED Spot Light',
      'Power Source': 'USB Fast Rechargeable Battery',
      'Battery Life': 'Up to 90 Minutes Runtime per Charge',
      'In The Box': '1x Callus Remover, 3x Grinding Heads, 1x USB Cable, 1x Cleaning Brush',
      'Warranty': '7 Days Replacement Guarantee'
    });

    const p2Res = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        brand, badge, price, sale_price, discount_percentage, stock_quantity,
        is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 5.0, 6, true, true)
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
      footTitle, footSlug, footTagline, footDesc, footFeatures, footSpecs,
      categoryId, 'PediCare', 'BESTSELLER', 1899, 1299, 32, 70, 'DK-FOOT-CALLUS-09'
    ]);
    const p2Id = p2Res.rows[0].id;
    console.log('✅ Foot Callus Remover Product ID:', p2Id);

    // Foot Images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [p2Id]);
    for (let i = 0; i < footImages.length; i++) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5)
      `, [p2Id, `/uploads/${footImages[i].name}.webp`, footTitle, i === 0, i]);
    }

    // Foot Reviews
    await client.query('DELETE FROM reviews WHERE product_id = $1', [p2Id]);
    const footReviews = [
      { name: 'Tahir Mehmood', city: 'Lahore', rating: 5, comment: 'Meri phati hui aariyan (cracked heels) bilkul naram aur saaf ho gayi hain pehle hi use me. Zabardast product hai.' },
      { name: 'Samina Akram', city: 'Karachi', rating: 5, comment: 'Parlor jane ki zarurat nahi rahi pedicure ke liye. Rollers bohot effective hain aur bilkul pain nahi hota.' },
      { name: 'Usman Ali', city: 'Islamabad', rating: 5, comment: 'Light feature bohot useful hai. USB charging cable sath mili hai. Quality 10/10 hai.' },
      { name: 'Naveed Akhtar', city: 'Faisalabad', rating: 5, comment: 'Fast delivery by Dkart. Product original box me receive hui with extra rollers. Recommended!' },
      { name: 'Huma Tariq', city: 'Rawalpindi', rating: 5, comment: 'Feet feel so soft and smooth! Very easy to clean under water after using.' },
      { name: 'رخسانہ کوثر', city: 'Gujranwala', rating: 5, comment: 'پاؤں کی مردہ اور سخت کھال بالکل آسانی سے اتر جاتی ہے۔ بہت زبردست ٹول ہے!' }
    ];
    for (const r of footReviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, '[]', true)
      `, [p2Id, r.name, r.city, r.rating, r.comment]);
    }

    console.log('\n🎉 BOTH PRODUCTS SUCCESSFULLY SEEDED IN SUPABASE!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
