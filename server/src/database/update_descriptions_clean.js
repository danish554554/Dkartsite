import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const kemeiDesc = `Upgrade your grooming routine with the Kemei 3-in-1 Rechargeable Multi-Grooming Machine. Engineered specifically for daily styling and travel convenience, this all-in-one grooming kit combines a high-speed hair clipper, a smooth foil shaver, and a precision nose and ear trimmer in a single ergonomic device.

Switch effortlessly between the wide clipper head for hair and beard trimming, the micro-foil shaver head for a clean irritation-free finish, and the rotary detailer for neat nose and ear trimming. The precision-ground stainless steel blades glide smoothly through thick hair and coarse stubble without pulling, tugging, or skin irritation.

Enjoy cordless grooming freedom with the rechargeable battery delivering up to 60 minutes of continuous runtime on a full charge. The textured anti-slip handle provides comfortable grip and total control along the jawline and neck. Each cutting head detaches in seconds for quick cleaning under running water with the included maintenance brush.`;

const standDesc = `Keep your hands free and your posture comfortable with the Universal Adjustable Desktop Mobile & Tablet Stand. Designed for modern smartphones, phablets, and tablets up to 11 inches, this premium foldable stand provides stable, shake-free support for video calls, online classes, streaming movies, gaming, and recipe viewing in the kitchen.

Smoothly adjust your viewing angle from 0 to 120 degrees and extend the telescopic arm to the ergonomic height that reduces neck strain and eye fatigue. High-friction silicone pads protect your phone from scratches and keep the stand firmly grounded without slipping.

An ergonomically cut cable slot lets you plug in your charging cable or earphones while your device remains safely docked. Folds down completely flat in seconds, fitting easily into your pocket, laptop bag, or backpack for effortless travel.`;

async function run() {
  await pool.query(
    `UPDATE products SET description = $1 WHERE slug = $2`,
    [kemeiDesc, 'kemei-3-in-1-rechargeable-hair-clipper-shaver-trimmer']
  );
  await pool.query(
    `UPDATE products SET description = $1 WHERE id = 250`,
    [standDesc]
  );

  const res = await pool.query('SELECT id, title, description FROM products WHERE id IN (308, 250)');
  console.log('✅ Cleaned products in DB:');
  res.rows.forEach(r => {
    console.log(`Product #${r.id} (${r.title}):\n${r.description.slice(0, 100)}...\n`);
  });

  // Verify no products have raw markdown remaining in DB
  const all = await pool.query('SELECT id, title, description FROM products');
  const leftover = all.rows.filter(p => p.description && (p.description.includes('**') || p.description.includes('###')));
  console.log(`Leftover products with markdown in DB: ${leftover.length}`);

  await pool.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
