import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const oneStepDir = 'D:/products/one step hair brush';
const oneStepSubDir = 'D:/products/one step hair brush/One steps 3 in 1 Hair Brush';
const yesFinishingDir = "D:/products/2in1 Women Epilator Shaver depilatory Lady hair Remover tool women's facial hair remover best mini rechargeable professional machine _ Daraz.pk";

const targets = [
  'D:/ML/Dkart Business/Dkart Store/client/public/uploads',
  'D:/ML/Dkart Business/Dkart Store/server/public/uploads',
  'D:/ML/Dkart Business/Dkart app/public/uploads'
];

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const jobs = [
  // 1. One Step Hair Dryer Brush
  { src: path.join(oneStepSubDir, 'download.png'), name: 'hair-dryer-brush-3-in-1-main' },
  { src: path.join(oneStepDir, 'download (10).png'), name: 'hair-dryer-brush-3-in-1-usage' },
  { src: path.join(oneStepDir, 'download (3).png'), name: 'hair-dryer-brush-3-in-1-styling' },
  { src: path.join(oneStepDir, 'download (4).png'), name: 'hair-dryer-brush-3-in-1-modes' },
  { src: path.join(oneStepSubDir, 'download (11).png'), name: 'hair-dryer-brush-3-in-1-box' },

  // 2. Yes Finishing Hair Remover
  { src: path.join(yesFinishingDir, 'imgi_59_b0c51e7c32c9a732d8f3e5b586df3598.jpg'), name: 'yes-finishing-hair-remover-main' },
  { src: path.join(yesFinishingDir, 'imgi_54_cfb394b00301556b8369144f155484b6.jpg'), name: 'yes-finishing-hair-remover-features' },
  { src: path.join(yesFinishingDir, 'imgi_55_a48e03fe4f2b8fdb0e64931f79b45ad3.jpg'), name: 'yes-finishing-hair-remover-details' },
  { src: path.join(yesFinishingDir, 'imgi_56_eae31e7e1d9b5343d782ede40bd79404.jpg'), name: 'yes-finishing-hair-remover-usage' },
  { src: path.join(yesFinishingDir, 'imgi_57_8bfb4d39536f7dfeb32aa6886ac37fbb.jpg'), name: 'yes-finishing-hair-remover-box' }
];

async function fixAllImages() {
  console.log('🎨 Generating all WebP and JPG images (<100KB)...');

  for (const t of targets) {
    if (!fs.existsSync(t)) fs.mkdirSync(t, { recursive: true });
  }

  for (const job of jobs) {
    if (!fs.existsSync(job.src)) {
      console.log('⚠️ Source not found:', job.src);
      continue;
    }

    for (const t of targets) {
      const outWebp = path.join(t, job.name + '.webp');
      const outJpg = path.join(t, job.name + '.jpg');

      await sharp(job.src)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outWebp);

      await sharp(job.src)
        .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(outJpg);

      const sizeW = fs.statSync(outWebp).size;
      const sizeJ = fs.statSync(outJpg).size;
      console.log(`✅ Saved ${job.name} -> WebP: ${(sizeW/1024).toFixed(1)}KB | JPG: ${(sizeJ/1024).toFixed(1)}KB`);
    }
  }

  console.log('🔄 Syncing Supabase product_images table...');
  const client = await pool.connect();
  try {
    // 1. Check Product 1
    const p1 = await client.query("SELECT id FROM products WHERE slug = '3-in-1-hair-dryer-brush'");
    if (p1.rows[0]) {
      const p1Id = p1.rows[0].id;
      await client.query('DELETE FROM product_images WHERE product_id = $1', [p1Id]);
      const p1Images = [
        { url: '/uploads/hair-dryer-brush-3-in-1-main.webp', is_primary: true, display_order: 0 },
        { url: '/uploads/hair-dryer-brush-3-in-1-usage.webp', is_primary: false, display_order: 1 },
        { url: '/uploads/hair-dryer-brush-3-in-1-styling.webp', is_primary: false, display_order: 2 },
        { url: '/uploads/hair-dryer-brush-3-in-1-modes.webp', is_primary: false, display_order: 3 },
        { url: '/uploads/hair-dryer-brush-3-in-1-box.webp', is_primary: false, display_order: 4 }
      ];
      for (const img of p1Images) {
        await client.query(
          'INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES ($1, $2, $3, $4, $5)',
          [p1Id, img.url, 'Hair Dryer Brush 3 in 1 Hot Air Brush', img.is_primary, img.display_order]
        );
      }
      console.log('✅ Product 1 (One Step) images synced in Supabase!');
    }

    // 2. Check Product 2
    const p2 = await client.query("SELECT id FROM products WHERE slug = 'yes-finishing-hair-remover'");
    if (p2.rows[0]) {
      const p2Id = p2.rows[0].id;
      await client.query('DELETE FROM product_images WHERE product_id = $1', [p2Id]);
      const p2Images = [
        { url: '/uploads/yes-finishing-hair-remover-main.webp', is_primary: true, display_order: 0 },
        { url: '/uploads/yes-finishing-hair-remover-features.webp', is_primary: false, display_order: 1 },
        { url: '/uploads/yes-finishing-hair-remover-details.webp', is_primary: false, display_order: 2 },
        { url: '/uploads/yes-finishing-hair-remover-usage.webp', is_primary: false, display_order: 3 },
        { url: '/uploads/yes-finishing-hair-remover-box.webp', is_primary: false, display_order: 4 }
      ];
      for (const img of p2Images) {
        await client.query(
          'INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES ($1, $2, $3, $4, $5)',
          [p2Id, img.url, 'Yes Finishing Rechargeable Hair Removal Shaver', img.is_primary, img.display_order]
        );
      }
      console.log('✅ Product 2 (Yes Finishing) images synced in Supabase!');
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('🎉 All product images generated and database synced successfully!');
}

fixAllImages().catch(console.error);
