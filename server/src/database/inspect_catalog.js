import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function listCurrent() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, slug, title, price, sale_price FROM products ORDER BY id');
    console.log('=== ALL PRODUCTS IN SUPABASE ===');
    for (const p of res.rows) {
      console.log(`\nProduct #${p.id}: ${p.title} (${p.slug})`);
      const imgRes = await client.query('SELECT url, is_primary, display_order FROM product_images WHERE product_id = $1 ORDER BY display_order', [p.id]);
      imgRes.rows.forEach(i => {
        const localPath = path.join('D:/ML/Dkart Business/Dkart Store/client/public', i.url);
        const exists = fs.existsSync(localPath);
        console.log(`  - [${i.is_primary ? 'PRIMARY' : 'GALLERY'}] ${i.url} (${exists ? 'File OK' : 'File Missing ❌'})`);
      });
    }
  } finally {
    client.release();
    await pool.end();
  }
}

listCurrent().catch(console.error);
