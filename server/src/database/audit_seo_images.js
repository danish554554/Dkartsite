import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function audit() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT p.id as product_id, p.slug, p.title, pi.id as image_id, pi.url, pi.alt_text, pi.is_primary, pi.display_order
      FROM product_images pi
      JOIN products p ON pi.product_id = p.id
      ORDER BY p.id, pi.display_order
    `);
    console.log(`=== AUDITING ${res.rows.length} PRODUCT IMAGES ===`);
    for (const r of res.rows) {
      console.log(`[P#${r.product_id} | ${r.slug}] (Order ${r.display_order}) -> ${r.url}`);
      console.log(`   Current alt: "${r.alt_text || 'EMPTY'}"`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

audit().catch(console.error);
