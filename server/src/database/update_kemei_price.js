import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function updatePrice() {
  const regularPrice = 2899;
  const salePrice = 2199;
  const discount = Math.round(((regularPrice - salePrice) / regularPrice) * 100);

  const res = await pool.query(
    `UPDATE products 
     SET price = $1, sale_price = $2, discount_percentage = $3 
     WHERE slug = $4 
     RETURNING id, title, price, sale_price, discount_percentage`,
    [regularPrice, salePrice, discount, 'kemei-3-in-1-rechargeable-hair-clipper-shaver-trimmer']
  );

  console.log('✅ Updated in Database:', res.rows[0]);
  await pool.end();
}

updatePrice().catch(err => {
  console.error(err);
  process.exit(1);
});
