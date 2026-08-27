import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedData() {
  initDatabase();

  // Check if already seeded
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already has data. Skipping re-seed.');
    return;
  }

  console.log('Seeding initial Dkart database with premium store data...');

  // 1. Create Admin and Demo Customer
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const customerPasswordHash = bcrypt.hashSync('customer123', salt);

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, password_hash, phone, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUser.run('Dkart Admin', 'admin@dkart.pk', adminPasswordHash, '+92 300 1234567', 'admin');
  insertUser.run('Danish Riaz', 'customer@dkart.pk', customerPasswordHash, '+92 312 9876543', 'customer');

  // 2. Insert Categories
  const insertCat = db.prepare(`
    INSERT INTO categories (name, slug, description, image_url, is_featured, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const categories = [
    {
      name: 'Hair Styling & Care',
      slug: 'hair-styling',
      description: 'Professional salon-grade hot air brushes, stylers, and straighteners',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
      featured: 1,
      order: 1
    },
    {
      name: 'Personal Care & Grooming',
      slug: 'personal-care',
      description: 'Painless shavers, rechargeable epilators, and wellness tools',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
      featured: 1,
      order: 2
    },
    {
      name: 'Smart Wearables',
      slug: 'smart-wearables',
      description: 'AMOLED displays, Bluetooth calling watches, and fitness trackers',
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
      featured: 1,
      order: 3
    },
    {
      name: 'Audio & Sound',
      slug: 'audio-sound',
      description: 'Active Noise Cancellation earbuds, neckbands, and speakers',
      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
      featured: 1,
      order: 4
    },
    {
      name: 'Mobile Accessories',
      slug: 'mobile-accessories',
      description: 'GaN turbo fast chargers, magnetic wireless power banks, and cables',
      image: 'https://images.unsplash.com/photo-1609592424364-16a8d8e785fe?w=800&q=80',
      featured: 1,
      order: 5
    }
  ];

  for (const cat of categories) {
    insertCat.run(cat.name, cat.slug, cat.description, cat.image, cat.featured, cat.order);
  }

  // 3. Insert Banners
  const insertBanner = db.prepare(`
    INSERT INTO banners (title, subtitle, badge, cta_text, cta_link, image_url, position, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertBanner.run(
    'Redefining Modern Lifestyle & Tech',
    'Next-gen gadgets and personal care innovations designed for daily excellence. Cash on Delivery across Pakistan.',
    'EXCLUSIVE LAUNCH 2026',
    'Explore Collection',
    '/shop',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=85',
    'hero',
    1,
    1
  );

  insertBanner.run(
    'Dkart Titan Pro AMOLED Watch',
    '1.43" Ultra-Bright Display, BT Calling, 7-Day Battery. Flat 35% OFF this week.',
    'BESTSELLER',
    'Buy Now - Rs. 6,499',
    '/product/dkart-titan-pro-amoled-smartwatch',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&q=85',
    'hero',
    2,
    1
  );

  insertBanner.run(
    'Salon Finish at Home in Minutes',
    '3-in-1 Negative Ion Hair Styler & Dryer. Over 10,000+ satisfied customers nationwide.',
    'TRENDING VIRAL',
    'Order Now (Free Delivery)',
    '/product/dkart-3-in-1-hot-air-dryer-volumizer-brush',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80',
    'promo',
    1,
    1
  );

  // 4. Insert Products
  const insertProduct = db.prepare(`
    INSERT INTO products (
      title, slug, tagline, description, key_features, specs, category_id, brand,
      badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
      sku, rating_average, rating_count, is_featured, is_trending
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertVariant = db.prepare(`
    INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertReview = db.prepare(`
    INSERT INTO reviews (product_id, user_name, rating, comment, city, verified_purchase)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const products = [
    {
      title: 'Dkart 3-in-1 Hot Air Hair Dryer & Volumizer Brush',
      slug: 'dkart-3-in-1-hot-air-dryer-volumizer-brush',
      tagline: 'Blowout volume, smooth shine, and quick salon styling in one step',
      categoryId: 1,
      badge: 'Bestseller',
      price: 4499,
      sale_price: 2899,
      discount: 36,
      stock: 45,
      sku: 'DK-HAIR-001',
      ratingAvg: 4.9,
      ratingCount: 142,
      featured: 1,
      trending: 1,
      description: `Transform your daily hair styling routine with the Dkart 3-in-1 Hot Air Volumizer Brush. Engineered with advanced ionic conditioning and ceramic tourmaline barrels, it dries, detangles, and styles your hair simultaneously without extreme heat damage.\n\nIts unique oval design delivers instant root lift and voluptuous body while the tufted bristles smooth unruly frizz into silky salon perfection. Perfect for Pakistani climates and all hair textures.`,
      features: [
        'Advanced Negative Ionic Technology: Eliminates frizz and seals hair cuticles for mirror shine',
        'Ceramic Tourmaline Barrel: Even heat distribution that prevents hot spots and breakage',
        '3 Temperature & Speed Controls: Low, Medium, and High settings for precise custom styling',
        'Oval Barrel Design: 360-degree airflow vents for 50% faster drying times',
        'Tangle-Free 360° Swivel Cord: Hassle-free maneuvering without cord twisting',
        'Ergonomic Lightweight Grip: Comfortable to hold throughout entire styling sessions'
      ],
      specs: {
        'Power': '1000W High Efficiency Motor',
        'Voltage': '220V - 240V (Pakistani Standard Plug)',
        'Heat Levels': 'Cool / Warm / Hot',
        'Barrel Material': 'Ceramic Tourmaline Coating',
        'Warranty': '6 Months Dkart Official Replacement Guarantee',
        'In the Box': '1x 3-in-1 Volumizer Brush, User Manual, Warranty Card'
      },
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=85',
        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=900&q=85',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Matte Black & Rose Gold', modifier: 0, stock: 25 },
        { type: 'color', name: 'Pearl Pink Edition', modifier: 100, stock: 20 }
      ],
      reviews: [
        { user: 'Ayesha Khan', rating: 5, comment: 'MashAllah amazing product! Dries my thick wavy hair in under 12 minutes with perfect salon volume. Cash on delivery was quick to Lahore.', city: 'Lahore' },
        { user: 'Fatima Zahra', rating: 5, comment: 'Honest review: quality feels so premium, packaging is neat and heats up right away. 100% recommended for everyone.', city: 'Karachi' },
        { user: 'Sana Tariq', rating: 4, comment: 'Very easy to use, lightweight and doesn’t burn the scalp. Worth every rupee.', city: 'Islamabad' }
      ]
    },
    {
      title: 'Kemie 4-in-1 Rechargeable Painless Facial & Body Shaver',
      slug: 'kemie-4-in-1-rechargeable-shaver-trimmer',
      tagline: 'Flawless, irritation-free hair removal with USB-C quick recharge',
      categoryId: 2,
      badge: 'Hot Deal',
      price: 3299,
      sale_price: 1999,
      discount: 39,
      stock: 60,
      sku: 'DK-KEMIE-002',
      ratingAvg: 4.8,
      ratingCount: 96,
      featured: 1,
      trending: 1,
      description: `Experience effortless, pain-free grooming anywhere with the Kemie 4-in-1 Rechargeable Shaver. Specially engineered for delicate skin areas including peach fuzz, upper lips, eyebrows, underarms, and bikini lines.\n\nFeaturing hypoallergenic stainless steel rotary heads, it trims flush with the skin without redness, bumps, or pulling. Fully washable IPX7 waterproof construction allows safe dry or wet use in the shower.`,
      features: [
        'Hypoallergenic Double-Ring Blades: Smooth gliding with zero irritation or redness',
        '4 Interchangeable Heads: Facial shaver, eyebrow precision styler, nose trimmer, and body razor',
        'USB Type-C Fast Rechargeable: 90 minutes continuous cordless runtime on a single charge',
        'Built-in LED Soft Light: Spot and eliminate the finest invisible peach fuzz hairs',
        'IPX7 Waterproof: Detachable heads wash clean under running tap water in seconds',
        'Pocket-Sized Elegance: Looks like a luxury lipstick; discreet for handbag carrying'
      ],
      specs: {
        'Battery': 'Li-ion 600mAh USB-C Rechargeable',
        'Charging Time': '1.5 Hours',
        'Runtime': 'Up to 90 Minutes',
        'Waterproof Rating': 'IPX7 Washable',
        'Blade Material': 'Surgical-Grade Stainless Steel',
        'In the Box': 'Shaver Unit, 4 Head Attachments, Type-C Cable, Cleaning Brush, Guide'
      },
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=85',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=900&q=85',
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Pearl White & Rose Gold', modifier: 0, stock: 35 },
        { type: 'color', name: 'Midnight Charcoal', modifier: 0, stock: 25 }
      ],
      reviews: [
        { user: 'Hira Siddiqui', rating: 5, comment: 'Extremely gentle on sensitive skin! No bumps or irritation at all. Battery lasts for weeks.', city: 'Rawalpindi' },
        { user: 'Maryam Bilal', rating: 5, comment: 'Received parcel in Faisalabad in 2 days. The packaging and build quality are top tier.', city: 'Faisalabad' }
      ]
    },
    {
      title: 'Dkart Titan Pro 1.43" AMOLED Bluetooth Calling Smartwatch',
      slug: 'dkart-titan-pro-amoled-smartwatch',
      tagline: 'Always-On Retina Display, crystal-clear BT calling, and 7-day battery life',
      categoryId: 3,
      badge: 'Bestseller',
      price: 9999,
      sale_price: 6499,
      discount: 35,
      stock: 35,
      sku: 'DK-WATCH-003',
      ratingAvg: 4.9,
      ratingCount: 215,
      featured: 1,
      trending: 1,
      description: `Crafted for ambitious achievers, the Dkart Titan Pro smartwatch sets the gold standard for wearable technology. Its 1.43-inch AMOLED display delivers deep blacks, vivid colors, and 850 nits peak outdoor brightness.\n\nEquipped with dual-mode Bluetooth 5.3 chips and an AI acoustic microphone, answer and conduct phone calls straight from your wrist with unrivaled audio clarity. Features comprehensive continuous biometric tracking for heart rate, blood oxygen (SpO2), stress levels, and sleep cycles.`,
      features: [
        '1.43" Ultra HD AMOLED Display (466x466 resolution) with Always-On Mode',
        'HD Bluetooth Calling: Built-in speaker and noise-reduction microphone',
        '7 to 10 Days Battery Life on standard use, with magnetic fast charging',
        'Comprehensive Health Suite: 24/7 Heart Rate, SpO2, Blood Pressure, and Sleep monitor',
        '110+ Sports & Workout Tracking modes with automatic movement detection',
        'IP68 Water & Dust Resistant: Sweat-proof, rain-proof, and wash-proof',
        'Instant Pakistani Notifications: WhatsApp, SMS, Calls, Bank alerts, and Urdu font support'
      ],
      specs: {
        'Display': '1.43" AMOLED 466*466, 850 Nits Peak Brightness',
        'Connectivity': 'Bluetooth 5.3 Dual Core Chipset',
        'Battery': '380mAh Li-Po (7-10 Days Regular Use)',
        'Compatibility': 'Android 6.0+ & iOS 11.0+ (Dkart Fit App)',
        'Casing': 'Zinc Alloy Metallic Finish with Ceramic Caseback',
        'In the Box': 'Smartwatch, Silicone Strap, Magnetic Charger, Screen Protector, Manual'
      },
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&q=85',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Stealth Black (Silicone Band)', modifier: 0, stock: 20 },
        { type: 'color', name: 'Space Silver (Magnetic Mesh Band)', modifier: 300, stock: 15 }
      ],
      reviews: [
        { user: 'Zubair Ahmed', rating: 5, comment: 'Zero Lifestyle watches cost 10k+, but this Dkart Titan Pro has better AMOLED clarity and battery for just 6,499. Absolute beast!', city: 'Karachi' },
        { user: 'Hamza Malik', rating: 5, comment: 'WhatsApp notifications with Urdu text render cleanly. Speaker volume during calls is loud and clear.', city: 'Islamabad' }
      ]
    },
    {
      title: 'Dkart Pods Max ANC Wireless Earbuds with 40H Playtime',
      slug: 'dkart-pods-max-anc-wireless-earbuds',
      tagline: '35dB Active Noise Cancellation, Quad-Mic ENC, and 13mm Bass Drivers',
      categoryId: 4,
      badge: 'Trending',
      price: 5999,
      sale_price: 3799,
      discount: 37,
      stock: 50,
      sku: 'DK-AUDIO-004',
      ratingAvg: 4.8,
      ratingCount: 178,
      featured: 1,
      trending: 1,
      description: `Immerse yourself in studio-grade audio with the Dkart Pods Max. Featuring Hybrid Active Noise Cancellation up to 35dB, block out traffic, air conditioners, and background chatter with a single touch.\n\nEquipped with 4 ENC beamforming microphones for crystal-clear Pakistani phone calls even on noisy roads or motorbikes. Enjoy up to 8 hours of playback per charge, extended to 40 hours with the matte pocket case.`,
      features: [
        '35dB Hybrid ANC + Transparency Ambient Mode',
        '13mm Titanium Composite Diaphragm drivers delivering deep punchy bass',
        'Quad-Mic AI Environmental Noise Cancellation (ENC) for clear calling',
        '45ms Ultra-Low Latency Gaming & Movie Mode',
        'Up to 40 Hours Total Playback (Type-C Fast Charge: 10 mins = 2 hours)',
        'Smart Touch Controls: Volume, Play/Pause, Track skip, Voice Assistant',
        'IPX5 Splash & Sweat Resistant'
      ],
      specs: {
        'Driver': '13mm Titanium Dynamic',
        'Bluetooth': 'Version 5.3 (15m range)',
        'Playtime': '8 hrs per earbud / 40 hrs with case',
        'Latency': '45ms in Game Mode',
        'Water Resistance': 'IPX5 Sweat-proof',
        'In the Box': 'Earbuds, Charging Case, 3 Pairs Ear Tips (S/M/L), USB-C Cable'
      },
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=85',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=900&q=85',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Matte Onyx Black', modifier: 0, stock: 30 },
        { type: 'color', name: 'Glacier Pure White', modifier: 0, stock: 20 }
      ],
      reviews: [
        { user: 'Usman Ali', rating: 5, comment: 'Bass is super heavy and ANC actually works really well against fan noise. Great value for Rs. 3,799.', city: 'Lahore' },
        { user: 'Saad Farooq', rating: 5, comment: 'Calling mic is top class. Spoke with client while riding bike and they heard me clearly.', city: 'Peshawar' }
      ]
    },
    {
      title: 'Dkart 65W GaN Turbo 3-Port Ultra-Fast Wall Charger',
      slug: 'dkart-65w-gan-turbo-fast-charger',
      tagline: 'Charge your Laptop, iPhone, and Android simultaneously at blazing speed',
      categoryId: 5,
      badge: 'Top Rated',
      price: 4200,
      sale_price: 2650,
      discount: 37,
      stock: 40,
      sku: 'DK-PWR-005',
      ratingAvg: 4.9,
      ratingCount: 94,
      featured: 0,
      trending: 1,
      description: `Power all your essentials with one pocket-sized adapter. Powered by 3rd Generation GaN (Gallium Nitride) semiconductor technology, the Dkart 65W Turbo Charger is 50% smaller than standard laptop bricks while generating minimal heat.\n\nFeatures 2x USB-C PD 3.0 ports and 1x USB-A QC 3.0 port with intelligent power allocation. Charges iPhone 16/15 from 0% to 60% in just 25 minutes, and powers MacBooks and Type-C laptops at full 65W speed.`,
      features: [
        'GaN III Technology: Maximum power efficiency in a compact form factor',
        '65W High-Power Output: Capable of charging laptops, tablets, and phones',
        '3-in-1 Multi-Port Charging: 2 Type-C (PD 3.0) + 1 USB-A (QC 3.0)',
        'Smart Power Distribution: Protects batteries by adjusting wattage in real time',
        'Pakistani Standard 2-Pin Plug: Fits all standard Pakistani wall sockets firmly',
        '10-Layer Safety Protection: Over-voltage, short-circuit, and fireproof casing'
      ],
      specs: {
        'Max Output': '65W Max',
        'Input': 'AC 100-240V ~ 50/60Hz 1.5A',
        'Ports': '2x USB-C + 1x USB-A',
        'Protocols': 'PD 3.0, QC 4+, PPS, AFC, FCP',
        'Plug Type': 'Pakistani Round 2-Pin (Europlug)',
        'In the Box': '65W GaN Charger, Quick Start Guide'
      },
      images: [
        'https://images.unsplash.com/photo-1609592424364-16a8d8e785fe?w=900&q=85',
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Space Gray', modifier: 0, stock: 25 },
        { type: 'color', name: 'Alpine White', modifier: 0, stock: 15 }
      ],
      reviews: [
        { user: 'Bilal Chaudhry', rating: 5, comment: 'Charges my HP laptop and Samsung S24 at the same time. Never gets dangerously hot. Super solid.', city: 'Multan' }
      ]
    },
    {
      title: 'Dkart MagSafe 10,000mAh Magnetic Wireless Power Bank',
      slug: 'dkart-magsafe-10000mah-wireless-powerbank',
      tagline: 'Snap and charge wirelessly with 22.5W PD wired boost and digital display',
      categoryId: 5,
      badge: 'Hot Deal',
      price: 5500,
      sale_price: 3499,
      discount: 36,
      stock: 30,
      sku: 'DK-PWR-006',
      ratingAvg: 4.7,
      ratingCount: 63,
      featured: 0,
      trending: 0,
      description: `Never worry about low battery again. The Dkart MagSafe Power Bank features ultra-strong N52 neodymium magnets that snap securely to iPhone 12/13/14/15/16 and MagSafe-compatible Android cases.\n\nDelivers 15W wireless output plus 22.5W two-way fast charging through USB-C. The integrated LED percentage screen gives accurate battery readouts, all wrapped in a premium aluminum alloy heat-dissipating shell.`,
      features: [
        'Strong Magnetic Snap: Will not slip or detach even during active phone use',
        '10,000mAh Real Capacity: Charges smartphone 2 to 2.5 full times',
        'Dual Fast Charging: 15W Magnetic Wireless + 22.5W PD Wired',
        'Smart Digital LED Display: Real-time battery percentage at a glance',
        'Ultra-Slim Form Factor: Fits naturally in hand behind phone camera bump',
        'Airline Travel Approved: Compliant with international aviation guidelines'
      ],
      specs: {
        'Capacity': '10,000mAh / 37Wh',
        'Wireless Output': '5W / 7.5W / 10W / 15W Max',
        'USB-C Input/Output': 'PD 20W / 22.5W Max',
        'Material': 'Aluminum Alloy + Tempered Glass Face',
        'Weight': '188g',
        'In the Box': 'Power Bank, 60W Braided Type-C Cable, Magnetic Ring Sticker'
      },
      images: [
        'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=900&q=85',
        'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Titanium Gray', modifier: 0, stock: 20 },
        { type: 'color', name: 'Deep Indigo Blue', modifier: 0, stock: 10 }
      ],
      reviews: [
        { user: 'Daniyal Naim', rating: 5, comment: 'Magnet is crazy strong. Charges my iPhone 15 Pro seamlessly without any heating issue.', city: 'Islamabad' }
      ]
    },
    {
      title: 'Dkart Ceramic 2-in-1 Hair Straightener & Curler Wand',
      slug: 'dkart-ceramic-2-in-1-hair-straightener-curler',
      tagline: 'Silky pin-straight or bouncy beach waves with negative ion shield',
      categoryId: 1,
      badge: 'New',
      price: 3999,
      sale_price: 2499,
      discount: 38,
      stock: 40,
      sku: 'DK-HAIR-007',
      ratingAvg: 4.8,
      ratingCount: 112,
      featured: 0,
      trending: 1,
      description: `Achieve two glamorous looks with one versatile styling tool. The Dkart 2-in-1 Straightener & Curler features twisted tourmaline ceramic floating plates that glide snag-free down your hair shafts.\n\nStraighten hair to glassy perfection, or twist and pull to create effortless bouncy curls in seconds. Rapid PTC heating reaches desired temperature in just 15 seconds, backed by automatic 60-minute safety shut-off.`,
      features: [
        '2-in-1 Dual Functionality: Straighten and curl with twisted plate design',
        'PTC Instant 15s Heat-Up: No waiting; ready when you are',
        'Digital LCD Temperature Control: 140°C to 230°C for all hair types',
        'Anti-Scald Insulated Tip: Protects fingers and face while styling',
        '60-Minute Auto Shut-Off: Peace of mind safety feature',
        'Worldwide Dual Voltage (110V-240V): Great for international travel'
      ],
      specs: {
        'Temperature Range': '140°C - 230°C (5 presets)',
        'Plates': 'Ceramic Tourmaline Micro-Floating',
        'Heat-Up Time': '15 Seconds',
        'Cord Length': '2.0m 360° Swivel',
        'Power': '45W Energy Efficient',
        'In the Box': '2-in-1 Styler, Heat Resistant Glove, 2 Hair Clips, Bag'
      },
      images: [
        'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=900&q=85',
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Metallic Purple', modifier: 0, stock: 25 },
        { type: 'color', name: 'Champagne Gold', modifier: 0, stock: 15 }
      ],
      reviews: [
        { user: 'Mehak Rizvi', rating: 5, comment: 'Takes 5 minutes to curl my entire hair. The curls hold the whole day without hairspray!', city: 'Karachi' }
      ]
    },
    {
      title: 'Dkart Sonic Pro Electric Toothbrush with UV Sanitizing Case',
      slug: 'dkart-sonic-pro-electric-toothbrush',
      tagline: '42,000 VPM acoustic cleaning, 5 brushing modes & 60-day battery',
      categoryId: 2,
      badge: 'Top Rated',
      price: 4800,
      sale_price: 2999,
      discount: 38,
      stock: 35,
      sku: 'DK-DENT-008',
      ratingAvg: 4.8,
      ratingCount: 76,
      featured: 0,
      trending: 0,
      description: `Elevate your oral health with the Dkart Sonic Pro. Powered by a magnetic levitation motor generating 42,000 acoustic strokes per minute, it dislodges plaque and stains 10x more effectively than manual toothbrushes.\n\nComes equipped with a portable travel case equipped with built-in UV-C ultraviolet sterilizing LEDs that kill 99.9% of bacteria on bristles automatically after each use. A single USB charge powers 60 days of brushing.`,
      features: [
        '42,000 Micro-Brushes Per Minute for dental clinic clean feel',
        '5 Smart Cleaning Modes: Clean, White, Polish, Massage, Sensitive',
        'Portable UV-C Sanitizing Travel Case: Kills 99.9% bacteria automatically',
        'Smart 2-Minute Timer with 30-Second Quad-Pacer interval pauses',
        'Dupont Diamond Bristles with color-fade replacement reminders',
        'IPX8 100% Waterproof: Safe to use in shower or bath',
        'Incredible 60-Day Battery Life on a single 3-hour Type-C charge'
      ],
      specs: {
        'Vibrations': 'Up to 42,000 VPM',
        'Battery': '1200mAh Lithium (60 Days Runtime)',
        'Waterproof': 'IPX8 Fully Submersible',
        'Case': 'UV-C LED Sanitizing Travel Case',
        'In the Box': 'Sonic Handle, UV Case, 4x Dupont Brush Heads, USB-C Cable'
      },
      images: [
        'https://images.unsplash.com/photo-1559591937-e62fb3d0914c?w=900&q=85',
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&q=85'
      ],
      variants: [
        { type: 'color', name: 'Matte Charcoal Black', modifier: 0, stock: 20 },
        { type: 'color', name: 'Pure Sky Blue', modifier: 0, stock: 15 }
      ],
      reviews: [
        { user: 'Dr. Taimoor', rating: 5, comment: 'As a dentist, I can vouch this is comparable to Oral-B and Philips Sonicare at a fraction of the cost. UV case is fantastic.', city: 'Lahore' }
      ]
    }
  ];

  for (const p of products) {
    const result = insertProduct.run(
      p.title,
      p.slug,
      p.tagline,
      p.description,
      JSON.stringify(p.features),
      JSON.stringify(p.specs),
      p.categoryId,
      'Dkart',
      p.badge,
      p.price,
      p.sale_price,
      p.discount,
      p.stock,
      1,
      p.sku,
      p.ratingAvg,
      p.ratingCount,
      p.featured,
      p.trending
    );

    const productId = result.lastInsertRowid;

    // Insert Images
    p.images.forEach((imgUrl, index) => {
      insertImage.run(productId, imgUrl, p.title, index === 0 ? 1 : 0, index);
    });

    // Insert Variants
    p.variants.forEach((v) => {
      insertVariant.run(productId, v.type, v.name, v.modifier, v.stock, p.images[0]);
    });

    // Insert Reviews
    p.reviews.forEach((r) => {
      insertReview.run(productId, r.user, r.rating, r.comment, r.city, 1);
    });
  }

  // 5. Insert Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertCoupon.run('DKART10', 'percentage', 10, 2000, 1);
  insertCoupon.run('WELCOME500', 'fixed', 500, 3000, 1);
  insertCoupon.run('FREESHIP', 'fixed', 199, 1500, 1);

  // 6. Insert Demo Orders
  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, user_id, customer_name, customer_phone, customer_email,
      shipping_address, payment_method, payment_status, order_status,
      subtotal, discount_amount, shipping_fee, total_amount, coupon_code,
      notes, tracking_number, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
      order_id, product_id, title, image, variant_name, unit_price, quantity, subtotal
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOrder.run(
    'DK-10492',
    2,
    'Danish Riaz',
    '+92 312 9876543',
    'customer@dkart.pk',
    JSON.stringify({
      fullName: 'Danish Riaz',
      phone: '+92 312 9876543',
      province: 'Punjab',
      city: 'Lahore',
      area: 'DHA Phase 5',
      address: 'Sector C, Street 14, House 22'
    }),
    'cod',
    'pending',
    'Processing',
    6499,
    0,
    0,
    6499,
    null,
    'Please call before delivering',
    'TCS-9283741'
  );

  insertOrderItem.run(
    'DK-10492',
    3,
    'Dkart Titan Pro 1.43" AMOLED Bluetooth Calling Smartwatch',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=85',
    'Stealth Black (Silicone Band)',
    6499,
    1,
    6499
  );

  console.log('Database seeding finished successfully with realistic Pakistani e-commerce catalog!');
}

// Execute directly if run via CLI
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData();
}
