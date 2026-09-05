import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const optimizedAlts = [
  // Product 1: One Step Hair Dryer Brush
  {
    url_pattern: '%hair-dryer-brush-3-in-1-main%',
    alt: 'One Step 3-in-1 Hair Dryer Brush with oval ceramic barrel and ergonomic handle for salon blowout volume'
  },
  {
    url_pattern: '%hair-dryer-brush-3-in-1-technology%',
    alt: 'Negative ion generator and 360-degree airflow vent technology on One Step hair dryer brush'
  },
  {
    url_pattern: '%hair-dryer-brush-3-in-1-bristles%',
    alt: 'Detangling nylon pin and tufted bristles for gentle scalp massage and frizz-free hair styling'
  },
  {
    url_pattern: '%hair-dryer-brush-3-in-1-settings%',
    alt: 'Three adjustable heat and speed settings control dial on One Step blow dryer styler'
  },
  {
    url_pattern: '%hair-dryer-brush-3-in-1-results%',
    alt: 'Before and after comparison of smooth straight blowout results using One Step hair dryer volumizer'
  },

  // Product 2: Yes Finishing Touch
  {
    url_pattern: '%yes-finishing-hair-remover-main%',
    alt: 'Yes Finishing Touch rechargeable painless hair remover with white and purple ergonomic body'
  },
  {
    url_pattern: '%yes-finishing-hair-remover-sensalight%',
    alt: 'Active Sensa-Light skin contact sensor illuminating fine facial hair and peach fuzz'
  },
  {
    url_pattern: '%yes-finishing-hair-remover-heads%',
    alt: 'Dual interchangeable micro-foil shaver head and precision trimmer attachment for sensitive areas'
  },
  {
    url_pattern: '%yes-finishing-hair-remover-application%',
    alt: 'Facial, underarm, arms, and bikini line hair removal guide using Yes Finishing Touch shaver'
  },
  {
    url_pattern: '%yes-finishing-hair-remover-packaging%',
    alt: 'Yes Finishing Touch retail packaging box with USB charging cord and cleaning brush accessories'
  },

  // Product 3: Nova 2-in-1
  {
    url_pattern: '%nova-2-in-1-hair-straightener-curler-main%',
    alt: 'Nova 2-in-1 hair straightener and curling iron NHC-2009 in metallic pink finish'
  },
  {
    url_pattern: '%nova-2-in-1-hair-straightener-curler-plates%',
    alt: 'Ceramic tourmaline coated flat iron heating plates for even temperature and heat protection'
  },
  {
    url_pattern: '%nova-2-in-1-hair-straightener-curler-wand%',
    alt: 'Curling wand barrel clamp mode for creating soft bouncy curls and waves'
  },
  {
    url_pattern: '%nova-2-in-1-hair-straightener-curler-switch%',
    alt: 'One-click function switch to toggle between flat iron straightener and curling wand'
  },
  {
    url_pattern: '%nova-2-in-1-hair-straightener-curler-cord%',
    alt: '360-degree anti-tangle swivel power cord with standard Pakistani plug compatibility'
  },

  // Product 19: Kemei Body Shaver
  {
    url_pattern: '%kemei-rechargeable-hair-remover-main%',
    alt: 'Kemei rechargeable cordless electric lady shaver and epilator for body hair removal'
  },
  {
    url_pattern: '%kemei-rechargeable-hair-remover-features%',
    alt: 'Ergonomic compact grip and safety blade guard on Kemei body hair remover'
  },
  {
    url_pattern: '%kemei-rechargeable-hair-remover-blade%',
    alt: 'Hypoallergenic stainless steel shaving foil for gentle close shave without razor burn'
  },
  {
    url_pattern: '%kemei-rechargeable-hair-remover-usage%',
    alt: 'Underarm, legs, and delicate bikini line hair trimming demonstration with Kemei shaver'
  },

  // Product 25: Stainless Steel Deep Fryer
  {
    url_pattern: '%stainless-steel-deep-fryer-pot-main%',
    alt: '304 food-grade stainless steel deep fryer pot with wire mesh strainer basket and lid'
  },
  {
    url_pattern: '%stainless-steel-deep-fryer-pot-basket%',
    alt: 'Removable stainless steel frying basket with elevated stay-cool red heat resistant handle'
  },
  {
    url_pattern: '%stainless-steel-deep-fryer-pot-dimensions%',
    alt: 'Compact deep pot dimensions optimized for saving cooking oil and preventing hot oil splatter'
  },
  {
    url_pattern: '%stainless-steel-deep-fryer-pot-cooking%',
    alt: 'Deep frying crispy french fries, samosas, chicken nuggets, and pakoras on gas stove'
  },

  // Product 83: Daling Nose Trimmer
  {
    url_pattern: '%daling-electric-nose-trimmer-main%',
    alt: 'Daling DL-7106 electric nose and ear hair trimmer in sleek matte black finish'
  },
  {
    url_pattern: '%daling-electric-nose-trimmer-features%',
    alt: 'High-torque micro-motor and protective travel cap on Daling precision personal groomer'
  },
  {
    url_pattern: '%daling-electric-nose-trimmer-blade%',
    alt: '360-degree dual-edge rotary stainless steel blades for pain-free close trimming'
  },
  {
    url_pattern: '%daling-electric-nose-trimmer-washable%',
    alt: 'Water-washable detachable cutter head rinsing clean under running tap water'
  },
  {
    url_pattern: '%daling-electric-nose-trimmer-usage%',
    alt: 'Safe grooming for unwanted nose hair, ear hair, eyebrows, and mustache detailing'
  },

  // Product 100: Lint Remover
  {
    url_pattern: '%electric-lint-remover-fabric-shaver-main%',
    alt: 'Electric USB rechargeable lint remover and fabric defuzzer for clothes and winter sweaters'
  },
  {
    url_pattern: '%electric-lint-remover-fabric-shaver-blades%',
    alt: 'Upgraded 6-leaf stainless steel rotary blades behind smooth honeycomb protective mesh'
  },
  {
    url_pattern: '%electric-lint-remover-fabric-shaver-usage%',
    alt: 'Removing stubborn lint balls, pills, and bobbles from wool sweaters and cashmere shawls'
  },
  {
    url_pattern: '%electric-lint-remover-fabric-shaver-usb%',
    alt: 'Cordless USB charging port and fast recharge capability from laptop or power bank'
  },
  {
    url_pattern: '%electric-lint-remover-fabric-shaver-container%',
    alt: 'Transparent slide-off detachable lint storage container for easy mess-free emptying'
  },

  // Product 101: Eyebrow Trimmer
  {
    url_pattern: '%eyebrow-trimmer-facial-remover-main%',
    alt: 'Electric eyebrow trimmer and facial hair remover pen with rose gold lipstick design'
  },
  {
    url_pattern: '%eyebrow-trimmer-facial-remover-precision%',
    alt: 'Micro-precision tip accurately sculpting eyebrows and removing stray hairs around brow bone'
  },
  {
    url_pattern: '%eyebrow-trimmer-facial-remover-light%',
    alt: 'Built-in gentle LED guide light highlighting fine baby hairs and facial peach fuzz'
  },
  {
    url_pattern: '%eyebrow-trimmer-facial-remover-blades%',
    alt: 'Hypoallergenic 360-degree rotating stainless steel micro-cutter for pain-free epilation'
  },
  {
    url_pattern: '%eyebrow-trimmer-facial-remover-usage%',
    alt: 'Gentle facial grooming for upper lip, chin, sideburns, and forehead smooth skin'
  },

  // Product 132: Electric Razor for Women
  {
    url_pattern: '%electric-razor-women-waterproof-main%',
    alt: 'Waterproof cordless electric razor for women with ergonomic grip in pastel pink'
  },
  {
    url_pattern: '%electric-razor-women-waterproof-blades%',
    alt: 'Hypoallergenic 3-in-1 curved stainless steel blades and central floating shaver foil'
  },
  {
    url_pattern: '%electric-razor-women-waterproof-bikini%',
    alt: 'Precision trimming and close shaving for delicate bikini line, underarms, and legs'
  },
  {
    url_pattern: '%electric-razor-women-waterproof-washable%',
    alt: 'IPX7 100% waterproof body safe for wet shower use and direct tap water cleaning'
  },
  {
    url_pattern: '%electric-razor-women-waterproof-ergonomic%',
    alt: 'Ergonomic non-slip handheld contour with USB fast rechargeable lithium battery'
  },

  // Product 141: Foot Callus Remover
  {
    url_pattern: '%electric-foot-callus-remover-main%',
    alt: 'Electric foot callus remover and pedicure buffer with digital LED display and light'
  },
  {
    url_pattern: '%electric-foot-callus-remover-rollers%',
    alt: 'Interchangeable fine, regular, and coarse quartz crystal grinding heads for feet'
  },
  {
    url_pattern: '%electric-foot-callus-remover-results%',
    alt: 'Before and after cracked heel treatment showing smooth soft baby skin results'
  },
  {
    url_pattern: '%electric-foot-callus-remover-features%',
    alt: 'Dual-speed high torque motor and precision LED spot light illuminating foot contours'
  },
  {
    url_pattern: '%electric-foot-callus-remover-charging%',
    alt: 'USB fast rechargeable battery with up to 90 minutes runtime for at-home pedicure'
  }
];

async function updateAlts() {
  const client = await pool.connect();
  try {
    console.log('🚀 Updating all product image alt tags in Supabase with SEO-rich descriptions...');
    let updatedCount = 0;

    for (const item of optimizedAlts) {
      const res = await client.query(
        'UPDATE product_images SET alt_text = $1 WHERE url LIKE $2',
        [item.alt, item.url_pattern]
      );
      if (res.rowCount > 0) {
        updatedCount += res.rowCount;
        console.log(`✅ [${res.rowCount} image] -> "${item.alt}"`);
      }
    }

    console.log(`\n🎉 SUCCESS: ${updatedCount} product image alt tags enriched for SEO!`);
  } finally {
    client.release();
    await pool.end();
  }
}

updateAlts().catch(console.error);
