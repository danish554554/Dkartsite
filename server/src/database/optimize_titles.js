import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const optimizedTitles = [
  {
    id: 1,
    title: 'One Step 3-in-1 Hair Dryer Brush – Hot Air Blow Dryer, Straightener & Volumizer Styler for Women'
  },
  {
    id: 2,
    title: 'Yes Finishing Touch Rechargeable Painless Hair Remover for Women – Facial, Underarm & Bikini Shaver'
  },
  {
    id: 3,
    title: 'Nova 2-in-1 Hair Straightener & Curler for Women (Pink) – Ceramic Flat Iron & Wand Styler (NHC-2009)'
  },
  {
    id: 19,
    title: 'Kemei Rechargeable Body Hair Remover – Cordless Electric Shaver & Epilator for Gentle At-Home Touch-Ups'
  },
  {
    id: 25,
    title: 'Stainless Steel Deep Fryer Pot with Strainer Basket – Mini Oil Frying Cooker for Fries, Chicken & Snacks'
  },
  {
    id: 83,
    title: 'Daling DL-7106 Electric Nose & Ear Hair Trimmer for Men & Women – Washable Stainless Steel Groomer'
  }
];

async function updateAllTitles() {
  const client = await pool.connect();
  try {
    console.log('🔄 Updating all product titles in Supabase (Strict 80-120 characters)...');
    for (const item of optimizedTitles) {
      const len = item.title.length;
      if (len < 80 || len > 120) {
        throw new Error(`Title length invalid: ${len} for ID ${item.id}`);
      }
      await client.query('UPDATE products SET title = $1 WHERE id = $2', [item.title, item.id]);
      console.log(`✅ [ID ${item.id}] Length: ${len} chars | Updated title: "${item.title}"`);
    }
    console.log('\n🎉 ALL PRODUCT TITLES ARE STRICTLY WITHIN 80–120 CHARACTERS!');
  } finally {
    client.release();
    await pool.end();
  }
}

updateAllTitles().catch(console.error);
