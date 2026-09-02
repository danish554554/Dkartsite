import pg from 'pg';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

const genuineYesImages = [
  { src: 'D:/ML/Dkart Business/Dkart Store/server/uploads/yes-finishing-hair-remover-main.webp', name: 'yes-finishing-hair-remover-main' },
  { src: 'D:/ML/Dkart Business/Dkart Store/server/uploads/yes-finishing-hair-remover-sensalight.webp', name: 'yes-finishing-hair-remover-sensalight' },
  { src: 'D:/ML/Dkart Business/Dkart Store/server/uploads/yes-finishing-hair-remover-heads.webp', name: 'yes-finishing-hair-remover-heads' },
  { src: 'D:/ML/Dkart Business/Dkart Store/server/uploads/yes-finishing-hair-remover-application.webp', name: 'yes-finishing-hair-remover-application' },
  { src: 'D:/ML/Dkart Business/Dkart Store/server/uploads/yes-finishing-hair-remover-packaging.webp', name: 'yes-finishing-hair-remover-packaging' }
];

async function fix() {
  console.log('🖼️ Replacing pink epilator with genuine Yes Finishing Touch images...');

  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  for (const item of genuineYesImages) {
    if (!fs.existsSync(item.src)) {
      console.log('Missing source:', item.src);
      continue;
    }

    for (const t of targets) {
      const destWebp = path.join(t, item.name + '.webp');
      const destJpg = path.join(t, item.name + '.jpg');

      await sharp(item.src)
        .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destWebp);

      await sharp(item.src)
        .resize({ width: 900, height: 900, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(destJpg);

      console.log(`Saved ${item.name} in ${t} (WebP: ${(fs.statSync(destWebp).size/1024).toFixed(1)}KB)`);
    }
  }

  const client = await pool.connect();
  try {
    console.log('\n🔄 Updating Supabase Database for Product #2 (Yes Finishing Touch)...');

    // 1. Ensure correct category: Personal Care & Grooming
    const catRes = await client.query("SELECT id FROM categories WHERE slug = 'personal-care' LIMIT 1");
    const personalCareId = catRes.rows[0]?.id || 2;

    await client.query("UPDATE products SET category_id = $1 WHERE slug = 'yes-finishing-hair-remover'", [personalCareId]);
    console.log(`✅ Category updated to Personal Care & Grooming (ID: ${personalCareId})`);

    // 2. Clear old product_images and insert genuine images
    const p2Res = await client.query("SELECT id, title FROM products WHERE slug = 'yes-finishing-hair-remover'");
    const p2Id = p2Res.rows[0]?.id;

    if (p2Id) {
      await client.query('DELETE FROM product_images WHERE product_id = $1', [p2Id]);
      
      const newImages = [
        { url: '/uploads/yes-finishing-hair-remover-main.webp', is_primary: true, display_order: 0 },
        { url: '/uploads/yes-finishing-hair-remover-sensalight.webp', is_primary: false, display_order: 1 },
        { url: '/uploads/yes-finishing-hair-remover-heads.webp', is_primary: false, display_order: 2 },
        { url: '/uploads/yes-finishing-hair-remover-application.webp', is_primary: false, display_order: 3 },
        { url: '/uploads/yes-finishing-hair-remover-packaging.webp', is_primary: false, display_order: 4 }
      ];

      for (const img of newImages) {
        await client.query(`
          INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [p2Id, img.url, p2Res.rows[0].title, img.is_primary, img.display_order]);
      }
      console.log('✅ Product #2 images table updated in Supabase with genuine Yes Finishing Touch images!');
    }

    // 3. Audit all products and images in database
    console.log('\n=== CURRENT DATABASE AUDIT ===');
    const prods = await client.query(`
      SELECT p.id, p.slug, p.title, c.name as category_name,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image,
        (SELECT count(*) FROM product_images WHERE product_id = p.id) as image_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);

    for (const row of prods.rows) {
      console.log(`[ID ${row.id}] ${row.title}`);
      console.log(`  Category: ${row.category_name} | Images: ${row.image_count} | Primary: ${row.primary_image}`);
    }

  } finally {
    client.release();
    await pool.end();
  }
}

fix().catch(console.error);
