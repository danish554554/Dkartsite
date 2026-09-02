import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const humanDescriptions = [
  {
    id: 1,
    description: `Get a salon-quality blowout at home in less than 10 minutes. The One Step 3-in-1 Hair Dryer Brush combines the drying power of a blow dryer, the smoothing precision of a ceramic straightener, and the root lift of a volumizing brush into one simple tool.

With advanced negative ion conditioning and 360-degree airflow vents, it dries hair gently from the inside out while locking in natural moisture and eliminating frizz. Flexible nylon pin bristles glide effortlessly through damp hair to detangle without pulling.

Customize your look with three adjustable heat and speed settings suitable for fine, thick, or curly hair. Its lightweight body and 360-degree swivel cord make morning styling fast, comfortable, and effortless.`
  },
  {
    id: 2,
    description: `Enjoy instant, pain-free hair removal anywhere with the Yes Finishing Touch Rechargeable Shaver. Designed for smooth, irritation-free skin, this portable grooming device gently removes unwanted facial and body hair without razor bumps, nicks, or redness.

Equipped with intelligent Sensa-Light technology, the shaver activates automatically upon contact with your skin and glides effortlessly along curves. It includes two interchangeable heads: a micro-foil head for silky close finishes and a precision trimmer for longer hair.

Compact, whisper-quiet, and rechargeable via USB, it slips discreetly into your purse or vanity pouch for quick, comfortable touch-ups before meetings, weddings, or everyday outings.`
  },
  {
    id: 3,
    description: `Switch effortlessly between sleek straight locks and bouncy curls with the Nova 2-in-1 Hair Styler. Designed for busy mornings and special occasions, this versatile beauty tool locks into a ceramic flat iron or unlocks into a curling wand with a single click.

Featuring tourmaline ceramic-coated heating plates, it delivers fast, even heat up to 190°C in under 30 seconds, gliding through hair smoothly without snagging or tugging. Negative ion technology tames unruly static and flyaways, leaving hair with a brilliant, healthy shine.

Lightweight, compact, and easy to pack for travel, it features a 360-degree anti-tangle swivel cord and standard Pakistani socket compatibility.`
  },
  {
    id: 19,
    description: `A gentle, cordless electric body shaver designed for comfortable everyday grooming at home or during travel. Its contoured ergonomic grip makes it easy to hold and maneuver over delicate skin.

The stainless steel shaving head safely trims unwanted hair from arms, legs, underarms, and sensitive areas without pulling or causing razor irritation. It is gentle enough for regular maintenance between waxing sessions.

With a built-in rechargeable battery and included USB charging cable, you never have to worry about replacing disposable batteries. The removable head cleans easily under running water, keeping your personal care routine hygienic and hassle-free.`
  },
  {
    id: 25,
    description: `Enjoy crispy, golden, restaurant-style snacks at home while saving oil and keeping your kitchen clean. The Premium Stainless Steel Deep Fryer Pot is specially designed for everyday cooking, making it easier than ever to fry crispy french fries, samosas, pakoras, chicken wings, nuggets, and tempura.

Made from heavy-gauge food-grade 304 stainless steel, the pot heats quickly and evenly on any gas stove or induction cooktop. Its compact, deep-walled design fully immerses food while using much less oil than wide conventional pans, and the high sides help prevent hot oil from splattering onto your countertop.

The included stainless steel mesh basket features an elevated stay-cool handle, allowing you to lower snacks into bubbling oil and lift them out all at once so excess oil drains right back into the pot.`
  },
  {
    id: 83,
    description: `Keep your daily grooming routine effortless, clean, and comfortable with the Daling DL-7106 Electric Nose and Ear Hair Trimmer. Specially engineered for both men and women, this personal groomer safely trims unwanted hair without any painful tugging, pulling, or nicks.

Equipped with a high-torque, whisper-quiet micro-motor and a 360-degree dual-edge rotary stainless steel blade system, it trims neatly from both the top and sides for a smooth, close finish inside sensitive nasal and ear contours.

Its sleek, pocket-sized matte black body is lightweight and easy to hold. The cutter head twists off in one click for quick washing under tap water, while the built-in rechargeable battery gives you up to 60 minutes of cordless grooming on a single USB charge.`
  },
  {
    id: 100,
    description: `Give your favorite sweaters, woolens, blankets, and furniture a fresh, like-new look in seconds with the Electric USB Rechargeable Fabric Shaver. It gently lifts and removes stubborn lint balls, fuzz, and surface bobbles without damaging delicate fabrics.

Featuring an upgraded 6-leaf stainless steel rotary blade concealed behind a smooth honeycomb protective mesh, it safely glides over coats, shawls, sofas, and fleece jackets. Loose fuzz is drawn directly into a transparent, slide-off collection chamber for clean and easy disposal.

Rechargeable via any standard USB port, this compact handheld defuzzer gives you up to an hour of cordless power, making it an essential care tool for every Pakistani household, especially during winter.`
  },
  {
    id: 101,
    description: `Say goodbye to painful parlor threading, waxing, and razors. The Flawless Electric Eyebrow Trimmer and Facial Hair Remover is designed for quick, gentle, and completely pain-free touch-ups at home or on the go.

Crafted in an elegant, lipstick-sized design with gold accents, this discreet beauty tool fits effortlessly into your handbag. Its precision micro-blade head gently traces the natural contours of your brows to remove stray hairs from above, below, and between eyebrows without pulling or causing skin redness.

The built-in gentle LED guide light illuminates even the finest baby hairs and peach fuzz, making it easy to achieve perfectly sculpted brows and smooth facial skin in minutes. Simply charge it via USB, glide it in small circular motions, and rinse the detachable head under running water when you're done.`
  }
];

async function updateAll() {
  const client = await pool.connect();
  try {
    console.log('✍️ Updating all product descriptions to natural, human-written copy...');

    for (const item of humanDescriptions) {
      await client.query('UPDATE products SET description = $1 WHERE id = $2', [item.description.trim(), item.id]);
      console.log(`✅ Product ID ${item.id} updated with clean human description!`);
    }

    console.log('\n🎉 ALL PRODUCTS UPDATED! Zero robotic text, zero SEO meta labels.');
  } finally {
    client.release();
    await pool.end();
  }
}

updateAll().catch(console.error);
