import pg from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function inspectImages() {
  const client = await pool.connect();
  const res = await client.query('SELECT p.id, p.slug, pi.url, pi.is_primary, pi.display_order FROM products p LEFT JOIN product_images pi ON p.id = pi.product_id ORDER BY p.id, pi.display_order;');
  console.log('--- SUPABASE PRODUCT IMAGES ---');
  for (const row of res.rows) {
    const filePath = path.join('D:/ML/Dkart Business/Dkart Store/client/public', row.url || '');
    const exists = fs.existsSync(filePath);
    const size = exists ? (fs.statSync(filePath).size/1024).toFixed(1) + 'KB' : 'MISSING ❌';
    console.log(`P#${row.id} [${row.slug}] -> ${row.url} (Order: ${row.display_order}, Primary: ${row.is_primary}) | On Disk: ${size}`);
  }
  client.release();
  await pool.end();
}

inspectImages().catch(console.error);
