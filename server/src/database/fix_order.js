import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function fixKemei() {
  const client = await pool.connect();
  try {
    await client.query('UPDATE product_images SET is_primary = false WHERE product_id = 19');
    await client.query("UPDATE product_images SET is_primary = true, display_order = 0 WHERE product_id = 19 AND url LIKE '%main%'");
    await client.query("UPDATE product_images SET display_order = 1 WHERE product_id = 19 AND url LIKE '%features%'");
    await client.query("UPDATE product_images SET display_order = 2 WHERE product_id = 19 AND url LIKE '%blade%'");
    await client.query("UPDATE product_images SET display_order = 3 WHERE product_id = 19 AND url LIKE '%usage%'");
    console.log('✅ Kemei primary image and display order updated in Supabase!');
  } finally {
    client.release();
    await pool.end();
  }
}

fixKemei().catch(console.error);
