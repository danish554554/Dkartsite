import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixPrimary83() {
  const client = await pool.connect();
  try {
    await client.query('UPDATE product_images SET is_primary = false WHERE product_id = 83');
    await client.query("UPDATE product_images SET is_primary = true, display_order = 0 WHERE product_id = 83 AND url LIKE '%main%'");
    console.log('✅ Product 83 primary image set to main.webp');
  } finally {
    client.release();
    await pool.end();
  }
}

fixPrimary83().catch(console.error);
