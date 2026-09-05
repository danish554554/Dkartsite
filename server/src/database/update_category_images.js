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

async function downloadAndProcess() {
  console.log('🖼️ 1. Processing Category Images (< 100KB)...');

  // A. Hair Styling & Care Image
  const hairUrl = 'https://www.thehaircaregroup.com/globalassets/haircare-group/blocks/education-2026/styling-category_mobile_640x360_18012025.jpg';
  let hairBuffer;
  try {
    const res = await fetch(hairUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    hairBuffer = Buffer.from(await res.arrayBuffer());
    console.log('✅ Downloaded hair styling image from URL');
  } catch (e) {
    console.error('Failed to download hair image, fallback to placeholder:', e);
  }

  // B. Personal Care & Beauty Image (from uploaded file or URL)
  const personalUploaded = 'C:/Users/danis/.gemini/antigravity/brain/094c1c0c-1a2a-44e5-a09a-31bd3c94c95b/.user_uploaded/media_1788626411339.png';
  let personalBuffer;
  if (fs.existsSync(personalUploaded)) {
    personalBuffer = fs.readFileSync(personalUploaded);
    console.log('✅ Loaded personal care image from uploaded screenshot');
  } else {
    const pUrl = 'https://img.magnific.com/free-photo/stylish-beauty-women-elegent-enjoy-concept_53876-132577.jpg?semt=ais_hybrid&w=740&q=80';
    const res = await fetch(pUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    personalBuffer = Buffer.from(await res.arrayBuffer());
  }

  // C. Household Items Image (from generated image)
  const householdGenerated = 'C:/Users/danis/.gemini/antigravity/brain/094c1c0c-1a2a-44e5-a09a-31bd3c94c95b/household_items_category_1788626640343.jpg';
  const householdBuffer = fs.readFileSync(householdGenerated);
  console.log('✅ Loaded generated household items image');

  const jobs = [
    { buffer: hairBuffer, name: 'category-hair-styling' },
    { buffer: personalBuffer, name: 'category-personal-care' },
    { buffer: householdBuffer, name: 'category-household-items' }
  ];

  for (const job of jobs) {
    if (!job.buffer) continue;
    for (const t of targets) {
      const outWebp = path.join(t, job.name + '.webp');
      const outJpg = path.join(t, job.name + '.jpg');

      await sharp(job.buffer)
        .resize({ width: 800, height: 600, fit: 'cover' })
        .webp({ quality: 80 })
        .toFile(outWebp);

      await sharp(job.buffer)
        .resize({ width: 800, height: 600, fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(outJpg);

      console.log(`Saved ${job.name} in ${t} (WebP: ${(fs.statSync(outWebp).size/1024).toFixed(1)}KB)`);
    }
  }

  // 2. Update Supabase Categories table
  console.log('\n🔄 2. Updating Categories in Supabase Database...');
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE categories
      SET image_url = '/uploads/category-hair-styling.webp'
      WHERE slug = 'hair-styling';
    `);

    await client.query(`
      UPDATE categories
      SET image_url = '/uploads/category-personal-care.webp'
      WHERE slug = 'personal-care';
    `);

    await client.query(`
      UPDATE categories
      SET image_url = '/uploads/category-household-items.webp'
      WHERE slug = 'household-items';
    `);

    // Audit categories with live product count
    const auditRes = await client.query(`
      SELECT c.id, c.name, c.slug, c.image_url,
        (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) as actual_product_count
      FROM categories c
      ORDER BY c.id;
    `);

    console.log('\n=== LIVE CATEGORIES AUDIT ===');
    for (const row of auditRes.rows) {
      console.log(`[ID ${row.id}] ${row.name} (${row.slug})`);
      console.log(`   Products: ${row.actual_product_count} | Image: ${row.image_url}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

downloadAndProcess().catch(console.error);
