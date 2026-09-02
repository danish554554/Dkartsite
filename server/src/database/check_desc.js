import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function check() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id, slug, title, description FROM products ORDER BY id');
    console.log('=== ALL PRODUCT DESCRIPTIONS ===');
    for (const p of res.rows) {
      console.log(`\n================== ID: ${p.id} | ${p.slug} ==================`);
      console.log(`Title: ${p.title}`);
      console.log(`Description:\n${p.description}\n`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

check().catch(console.error);
