import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

export const supabasePool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export async function runSupabaseMigration() {
  console.log('🚀 Connecting to Supabase PostgreSQL...');
  const client = await supabasePool.connect();

  try {
    console.log('Creating tables in Supabase...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        is_featured BOOLEAN DEFAULT true,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        tagline TEXT,
        description TEXT NOT NULL,
        key_features JSONB DEFAULT '[]',
        specs JSONB DEFAULT '{}',
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        brand VARCHAR(100) DEFAULT 'Dkart',
        badge VARCHAR(50),
        price NUMERIC(10, 2) NOT NULL,
        sale_price NUMERIC(10, 2),
        discount_percentage INT DEFAULT 0,
        stock_quantity INT DEFAULT 50,
        is_in_stock BOOLEAN DEFAULT true,
        sku VARCHAR(100) UNIQUE,
        rating_average NUMERIC(3, 2) DEFAULT 5.0,
        rating_count INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT true,
        is_trending BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT false,
        display_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_type VARCHAR(100) NOT NULL,
        variant_name VARCHAR(100) NOT NULL,
        price_modifier NUMERIC(10, 2) DEFAULT 0,
        stock_quantity INT DEFAULT 50,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK(rating >= 1 AND rating <= 5),
        comment TEXT NOT NULL,
        city VARCHAR(100),
        images JSONB DEFAULT '[]',
        verified_purchase BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id SERIAL PRIMARY KEY,
        code VARCHAR(100) UNIQUE NOT NULL,
        discount_type VARCHAR(50) NOT NULL,
        discount_value NUMERIC(10, 2) NOT NULL,
        min_spend NUMERIC(10, 2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        customer_email VARCHAR(255),
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cod',
        payment_status VARCHAR(50) DEFAULT 'pending',
        order_status VARCHAR(50) DEFAULT 'Confirmed',
        subtotal NUMERIC(10, 2) NOT NULL,
        discount_amount NUMERIC(10, 2) DEFAULT 0,
        shipping_fee NUMERIC(10, 2) DEFAULT 0,
        total_amount NUMERIC(10, 2) NOT NULL,
        coupon_code VARCHAR(100),
        notes TEXT,
        tracking_number VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(100) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE SET NULL,
        title VARCHAR(500) NOT NULL,
        image TEXT,
        variant_name VARCHAR(100),
        unit_price NUMERIC(10, 2) NOT NULL,
        quantity INT NOT NULL,
        subtotal NUMERIC(10, 2) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        subtitle VARCHAR(255),
        image_url TEXT NOT NULL,
        link_url TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created/verified in Supabase.');

    // 1. Seed Admin
    const adminHash = bcrypt.hashSync('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING;
    `, ['Dkart Official Admin', 'admindkart@gmail.com', adminHash, '+92 342 5097760', 'admin']);

    // 2. Seed Categories
    const categories = [
      { name: 'Hair Styling & Care', slug: 'hair-styling', desc: 'Premium blow dryers, hair straighteners, curlers & styling brushes.' },
      { name: 'Personal Care & Grooming', slug: 'personal-care', desc: 'Painless shavers, trimmers, skin rejuvenators and body care.' },
      { name: 'Smart Lifestyle Tech', slug: 'smart-tech', desc: 'Smartwatches, wireless earbuds and everyday life innovations.' },
      { name: 'Home & Daily Essentials', slug: 'home-essentials', desc: 'Convenient home gadgets and lifestyle tools.' }
    ];

    for (const c of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, description, is_featured)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (slug) DO NOTHING;
      `, [c.name, c.slug, c.desc]);
    }

    const catRes = await client.query('SELECT id, slug FROM categories');
    const catMap = {};
    catRes.rows.forEach(r => { catMap[r.slug] = r.id; });

    // 3. Seed Coupons
    await client.query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
      VALUES ('DKART10', 'percentage', 10, 2000, true),
             ('WELCOME500', 'fixed', 500, 3000, true)
      ON CONFLICT (code) DO NOTHING;
    `);

    // Helper to seed a product
    async function seedProduct({ title, slug, tagline, description, keyFeatures, specs, catSlug, brand, badge, price, salePrice, stock, sku, images, variants, reviews }) {
      const catId = catMap[catSlug] || 1;
      const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

      const pRes = await client.query(`
        INSERT INTO products (
          title, slug, tagline, description, key_features, specs, category_id,
          brand, badge, price, sale_price, discount_percentage, stock_quantity,
          is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 5.0, $15, true, true)
        ON CONFLICT (slug) DO UPDATE SET 
          price = EXCLUDED.price,
          sale_price = EXCLUDED.sale_price,
          stock_quantity = EXCLUDED.stock_quantity
        RETURNING id;
      `, [
        title, slug, tagline, description, JSON.stringify(keyFeatures), JSON.stringify(specs),
        catId, brand, badge, price, salePrice, discount, stock, sku, reviews.length
      ]);

      const prodId = pRes.rows[0].id;

      // Images
      await client.query('DELETE FROM product_images WHERE product_id = $1', [prodId]);
      for (let i = 0; i < images.length; i++) {
        await client.query(`
          INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [prodId, images[i], title, i === 0, i]);
      }

      // Variants
      await client.query('DELETE FROM product_variants WHERE product_id = $1', [prodId]);
      for (const v of variants) {
        await client.query(`
          INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [prodId, v.type || 'color', v.name, v.priceModifier || 0, v.stock || 50, v.image || images[0]]);
      }

      // Reviews
      await client.query('DELETE FROM reviews WHERE product_id = $1', [prodId]);
      for (const r of reviews) {
        await client.query(`
          INSERT INTO reviews (product_id, user_name, rating, comment, city, images, verified_purchase)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [prodId, r.name, r.rating, r.comment, r.city, JSON.stringify(r.images || [])]);
      }

      console.log(`✅ Seeded product: ${title.substring(0, 35)}... (ID: ${prodId})`);
    }

    // Product 1: Hair Dryer Brush
    await seedProduct({
      title: 'Hair Dryer Brush 3 in 1 Hot Air Brush | Blow Dryer, Straightener & Volumizer for Hair Styling',
      slug: '3-in-1-hair-dryer-brush',
      tagline: 'Salon-grade blow dry, smooth straightening, and instant volume at home in under 10 minutes.',
      description: 'Transform your daily hair routine with the One Step 3-in-1 Hair Dryer Brush. Combining the power of a professional blow dryer, the smoothing precision of a ceramic hair straightener, and the lift of a volumizing brush, this all-in-one hot air styling tool lets you achieve bouncy salon-quality blowouts effortlessly at home in half the time.\n\nEngineered with advanced Negative Ion Technology and 360° airflow vents, it saturates the airflow to condition and soften hair while eliminating frizz and static.',
      keyFeatures: [
        '3-in-1 Multipurpose Hair Tool: Blow dryer, ceramic straightener, and volumizer in one single step.',
        'Negative Ion Technology: Neutralizes static, seals cuticles, locks in moisture, and eliminates frizz for shiny, silky hair.',
        'Unique Oval Barrel Design: Smooths out frizz while rounded edges create lifted volume at the roots.',
        '3 Adjustable Heat & Speed Modes: Low, Medium, and High heat settings customized for all hair types.',
        'Tangle-Free Combination Bristles: Nylon pin bristles with ball tips gently massage the scalp.',
        'Ceramic Coating Protection: Distributes heat evenly across the barrel to protect hair from damage.',
        '360° Swivel Power Cord: Flexible, tangle-free salon cord allows effortless styling at any angle.',
        'Cash on Delivery Nationwide: Order with 100% confidence with fast 2-4 day delivery across Pakistan.'
      ],
      specs: {
        'Product Type': '3-in-1 Hot Air Hair Dryer & Volumizer Brush',
        'Model': 'One Step Hair Styler Pro',
        'Power / Wattage': '1000W High Efficiency Motor',
        'Voltage': '220V - 240V ~ 50/60Hz (Standard Pakistani Socket)',
        'Heating Technology': 'Tourmaline Ceramic with Negative Ion Generator',
        'Heat / Speed Settings': '3 Modes (Cool / Low / High)',
        'Barrel Shape': 'Ergonomic Oval Brush Design',
        'Cord Length': '1.8m 360° Swivel Salon Cord',
        'In The Box': '1x One Step 3-in-1 Hair Dryer Brush, 1x User Manual, 1x Official Warranty Card'
      },
      catSlug: 'hair-styling',
      brand: 'One Step',
      badge: 'Hot Deal',
      price: 2899,
      salePrice: 2399,
      stock: 75,
      sku: 'DK-ONESTEP-01',
      images: [
        '/uploads/hair-dryer-brush-3-in-1-main.webp',
        '/uploads/hair-dryer-brush-3-in-1-usage.webp',
        '/uploads/hair-dryer-brush-3-in-1-styling.webp',
        '/uploads/hair-dryer-brush-3-in-1-modes.webp',
        '/uploads/hair-dryer-brush-3-in-1-box.webp'
      ],
      variants: [
        { name: 'Black & Pink Edition', priceModifier: 0, stock: 75 }
      ],
      reviews: [
        { name: 'Fatima Tariq', rating: 5, city: 'Lahore', comment: 'Bohot zabardast product hai! 10 minute me pure baal dry aur straight ho jate hain parlor jaisa blowout milta hai.', images: ['/uploads/hair-dryer-brush-3-in-1-main.webp'] },
        { name: 'Ayesha Khan', rating: 5, city: 'Karachi', comment: '100% original product received. Delivery fast thi aur packing bhi bohot achi thi. Recommended!', images: ['/uploads/hair-dryer-brush-3-in-1-box.webp'] },
        { name: 'Zainab Bibi', rating: 5, city: 'Islamabad', comment: 'Heavy hair ke liye best hai. Frizz bilkul khatam kar deta hai aur volume bohot acha ata hai.', images: ['/uploads/hair-dryer-brush-3-in-1-styling.webp'] },
        { name: 'Maryam Javed', rating: 5, city: 'Rawalpindi', comment: 'Daraz se bohot behtar quality mili hai. Heat settings bohot achi hain, scalp ko hurt nahi karti.', images: [] },
        { name: 'Sadia Malik', rating: 5, city: 'Faisalabad', comment: 'Price ke hisab se best investment hai. Office jane se pehle bohot time bachta hai.', images: [] },
        { name: 'سائرہ احمد', rating: 5, city: 'Multan', comment: 'بہت اچھا ڈرائر برش ہے۔ بالوں کو بالکل نقصان نہیں پہنچاتا اور بہت نرم اور چمکدار بنا دیتا ہے۔ شکریہ ڈی کارٹ!', images: [] }
      ]
    });

    // Product 2: Yes Finishing Touch
    await seedProduct({
      title: 'Yes Finishing Rechargeable Hair Removal Shaver for Women – Facial, Bikini Line & Underarm Painless Electric Trimmer',
      slug: 'yes-finishing-hair-remover',
      tagline: 'Instant, pain-free hair removal with smart Sensalight technology for smooth, glowing skin anywhere, anytime.',
      description: 'Say goodbye to painful waxing, razors, and expensive parlor treatments with the Yes Finishing Touch Instant & Painless Hair Remover. Engineered with advanced Sensa-Light Technology, the device automatically activates micro-oscillation only when in direct contact with skin, removing unwanted hair from roots without nicks, burns, redness, or bumps.',
      keyFeatures: [
        'Smart Sensa-Light Technology: Automatically activates micro-vibration upon skin contact for safe, painless hair removal.',
        '100% Pain-Free & Gentle: No nicks, cuts, razor burns, redness, or irritation—dermatologist recommended for sensitive skin.',
        'Dual Interchangeable Heads: Includes a micro-foil head for ultra-close smooth finishing and a precision trimmer head for longer hair.',
        'Full Body & Facial Application: Perfect for upper lip, chin, peach fuzz, underarms, bikini line, arms, and legs.',
        'USB Rechargeable Battery: Built-in rechargeable Li-ion battery with included USB charging cable—no extra batteries needed.',
        'Built-in LED Illumination: Integrated light reveals even the finest peach fuzz so you never miss a spot.',
        'Compact & Portable: Elegant, lightweight pocket-sized design easily slips into your handbag or travel vanity pouch.',
        'Cash on Delivery Nationwide: 100% genuine product with 7-day replacement warranty and fast delivery across Pakistan.'
      ],
      specs: {
        'Product Name': 'Yes Finishing Touch Rechargeable Hair Remover',
        'Model': 'Yes Instant Pain-Free Shaver Pro',
        'Power Source': 'USB Rechargeable (Built-in Lithium-Ion Battery)',
        'Technology': 'Active Sensa-Light Contact Sensor',
        'Heads Included': '1x Micro-Foil Head + 1x Trimmer Head',
        'Cleaning': 'Washable Removable Heads with Included Cleaning Brush',
        'Charging Time': 'Approximately 2 Hours for up to 60 Minutes use',
        'In The Box': '1x Yes Hair Remover Unit, 1x Micro-Foil Head, 1x Trimmer Head, 1x USB Cable, 1x Cleaning Brush, 1x Manual'
      },
      catSlug: 'personal-care',
      brand: 'Yes Finishing Touch',
      badge: 'Bestseller',
      price: 1799,
      salePrice: 1299,
      stock: 85,
      sku: 'DK-YES-02',
      images: [
        '/uploads/yes-finishing-hair-remover-main.webp',
        '/uploads/yes-finishing-hair-remover-features.webp',
        '/uploads/yes-finishing-hair-remover-details.webp',
        '/uploads/yes-finishing-hair-remover-usage.webp',
        '/uploads/yes-finishing-hair-remover-box.webp'
      ],
      variants: [
        { name: 'White & Purple Standard', priceModifier: 0, stock: 85 }
      ],
      reviews: [
        { name: 'Anum Sheikh', rating: 5, city: 'Karachi', comment: 'Bohot kamal device hai! Upper lips aur chin hair k liye bilkul painless hai koi red marks nahi bante.', images: ['/uploads/yes-finishing-hair-remover-main.webp'] },
        { name: 'Komal Rizvi', rating: 5, city: 'Lahore', comment: 'Original Yes trimmer mila hai, light sensor bilkul theek kam kar raha hai. 10/10 recommendation!', images: ['/uploads/yes-finishing-hair-remover-box.webp'] },
        { name: 'Rabia Noreen', rating: 5, city: 'Islamabad', comment: 'Travel friendly hai handbag me easily fit ho jata hai. Battery timing bhi bohot achi hai.', images: ['/uploads/yes-finishing-hair-remover-features.webp'] },
        { name: 'فریحہ ملک', rating: 5, city: 'Peshawar', comment: 'بہت بہترین پراڈکٹ ہے۔ ویکسنگ سے جان چھوٹ گئی۔ بالکل درد نہیں ہوتا اور چہرہ صاف ہو جاتا ہے۔', images: [] },
        { name: 'Iqra Hassan', rating: 5, city: 'Sialkot', comment: 'Painless hair removal at home! Fast delivery 2 days me parcel mil gya COD pe.', images: [] },
        { name: 'Nadia Pervez', rating: 5, city: 'Hyderabad', comment: 'Best for sensitive skin. Bilkul cuts ya rashes nahi aate. Packing bht secure thi.', images: [] }
      ]
    });

    // Product 3: Nova 2-in-1 Straightener & Curler
    await seedProduct({
      title: 'Nova Hair Straightener & Curler 2-in-1 for Women (Pink) | Electric Hair Styling Tool for Smooth & Wavy Hair',
      slug: 'nova-2-in-1-hair-straightener-curler',
      tagline: 'Dual-action ceramic technology: sleek straight silk or glamorous beach waves in under 5 minutes.',
      description: 'Upgrade your daily hair styling routine with the Nova 2-in-1 Hair Straightener and Curler (NHC-2009). Specially engineered for modern Pakistani women, this versatile electric styling tool seamlessly transitions from a precision ceramic flat iron straightener to a professional curling wand with a single switch.\n\nFeaturing advanced ceramic tourmaline heating plates, it delivers rapid, uniform heat distribution that effortlessly glides through hair without pulling, snagging, or causing heat damage.',
      keyFeatures: [
        '2-in-1 Dual Styling Functionality: Seamlessly switch between ceramic straightening and spiral wave curling with a single one-click lock mechanism.',
        'Ceramic Tourmaline Coated Plates: Distributes heat evenly without snagging or pulling, protecting natural hair proteins from heat damage.',
        'Rapid 30-Second Heat-Up: High-efficiency PTC heating element reaches optimal styling temperature (190°C) in under 30 seconds for quick morning touch-ups.',
        'Anti-Frizz Negative Ion Conditioning: Smooths down unruly cuticles, neutralizes static electricity, and leaves hair silky and luminous.',
        'Compact & Handbag Friendly: Lightweight ergonomic design slips easily into your purse, backpack, or vanity travel bag.',
        '360° Anti-Tangle Swivel Cord: Full maneuverability at any angle without cord twisting or tangling.',
        'Universal Safe 220V Voltage: Plug & play standard Pakistani 2-pin socket compatibility—no adapter needed.',
        'Cash on Delivery Nationwide: 100% genuine Nova styling tool with 7-day doorstep replacement warranty across Pakistan.'
      ],
      specs: {
        'Product Name': 'Nova 2-in-1 Hair Straightener & Curler',
        'Model': 'NHC-2009 Pink Edition',
        'Plate Material': 'Ceramic Tourmaline Nano-Glaze',
        'Temperature Range': 'Up to 190°C Constant Heat Protection',
        'Heating Technology': 'Instant PTC Rapid Heat Engine',
        'Power / Voltage': '35W | 220V-240V ~ 50Hz (Standard PK Socket)',
        'Cord Feature': '360° Swivel Anti-Winding Power Cord',
        'In The Box': '1x Nova 2-in-1 Hair Styler (Pink), 1x User Manual, 1x Official Warranty Card'
      },
      catSlug: 'hair-styling',
      brand: 'Nova Professional',
      badge: 'Top Pick',
      price: 1699,
      salePrice: 1099,
      stock: 90,
      sku: 'DK-NOVA-03',
      images: [
        '/uploads/nova-2-in-1-hair-straightener-curler-main.webp',
        '/uploads/nova-2-in-1-hair-straightener-curler-plates.webp',
        '/uploads/nova-2-in-1-hair-straightener-curler-curling.webp',
        '/uploads/nova-2-in-1-hair-straightener-curler-features.webp',
        '/uploads/nova-2-in-1-hair-straightener-curler-packaging.webp'
      ],
      variants: [
        { name: 'Pink & Silver Pro', priceModifier: 0, stock: 90 }
      ],
      reviews: [
        { name: 'Hina Qureshi', rating: 5, city: 'Lahore', comment: 'Bohot zabardast straightener aur curler hai! Daily college k liye use krti hu, 2 minute me heat ho jata hai aur hair bilkul straight ho jatay hain. 100% recommended for this price!', images: ['/uploads/nova-2-in-1-hair-straightener-curler-main.webp'] },
        { name: 'Sana Malik', rating: 5, city: 'Karachi', comment: 'Same as shown in pictures! Daraz se b achi aur fast delivery mili 2 din me parcel pohanch gya. Curler bht achay soft curls banata hai. Packing bht secure thi.', images: ['/uploads/nova-2-in-1-hair-straightener-curler-packaging.webp'] },
        { name: 'Aiman Sheikh', rating: 5, city: 'Islamabad', comment: 'Value for money product hai. Light weight hai to travel me carry krna bht easy hai. Heat bilkul perfect hai baal jalte nahi hain.', images: ['/uploads/nova-2-in-1-hair-straightener-curler-plates.webp'] },
        { name: 'ثنا خان', rating: 5, city: 'Rawalpindi', comment: 'بہت ہی شاندار پراڈکٹ ہے۔ سائز بہت مناسب ہے اور سیدھے اور گھنگھریالے دونوں طرح کے بالوں کے لیے بہترین کام کرتا ہے۔ کیش آن ڈلیوری پر جلدی مل گیا۔ شکریہ ڈی کارٹ!', images: [] },
        { name: 'Mahnoor Raza', rating: 5, city: 'Faisalabad', comment: 'Bht acha straightener ha, price k hisab se best quality ha. Office jane se pehle jaldi se hair set ho jatay hain.', images: [] },
        { name: 'Bushra Ali', rating: 5, city: 'Multan', comment: 'Original Nova NHC-2009 styler hai. Pink color bohot pyara hai aur curls bohat achay banatay hain.', images: [] }
      ]
    });

    console.log('🎉 ALL 3 PRODUCTS, REVIEWS & CATEGORIES MIGRATED TO SUPABASE SUCCESSFULLY!');

  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith('supabaseMigrate.js')) {
  runSupabaseMigration().then(() => {
    console.log('Done.');
    process.exit(0);
  });
}
