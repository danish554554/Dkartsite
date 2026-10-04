import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const cleanDescription = `Upgrade your grooming routine with the Kemei 3-in-1 Rechargeable Multi-Grooming Machine. Engineered specifically for daily styling and travel convenience, this all-in-one grooming kit combines a high-speed hair clipper, a smooth foil shaver, and a precision nose and ear trimmer in a single ergonomic device.

Switch effortlessly between the wide clipper head for hair and beard trimming, the micro-foil shaver head for a clean irritation-free finish, and the rotary detailer for neat nose and ear trimming. The precision-ground stainless steel blades glide smoothly through thick hair and coarse stubble without pulling, tugging, or skin irritation.

Enjoy cordless grooming freedom with the rechargeable battery delivering up to 60 minutes of continuous runtime on a full charge. The textured anti-slip handle provides comfortable grip and total control along the jawline and neck. Each cutting head detaches in seconds for quick cleaning under running water with the included maintenance brush.`;

async function run() {
  const res = await pool.query(
    `UPDATE products 
     SET description = $1 
     WHERE slug = $2 
     RETURNING id, title, description`,
    [cleanDescription, 'kemei-3-in-1-rechargeable-hair-clipper-shaver-trimmer']
  );
  console.log('✅ Updated product description in DB:', res.rows[0]);
  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
