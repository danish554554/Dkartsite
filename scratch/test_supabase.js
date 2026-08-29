import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://postgres:.%2FTQ%25L%2BRq%3Fs94sv@db.ptkybunorwwbejtbxsda.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testConn() {
  console.log('Connecting to Supabase PostgreSQL...');
  const client = await pool.connect();
  const res = await client.query('SELECT NOW() as current_time, version() as version;');
  console.log('✅ Connected to Supabase successfully!');
  console.log('Server Time:', res.rows[0].current_time);
  console.log('Version:', res.rows[0].version);
  client.release();
  await pool.end();
}

testConn().catch(err => {
  console.error('❌ Connection error:', err.message);
  process.exit(1);
});
