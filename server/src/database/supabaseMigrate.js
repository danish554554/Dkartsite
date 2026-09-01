import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

export async function runSupabaseMigration() {
  const client = await pool.connect();
  try {
    console.log('🚀 Checking Supabase schema...');

    // 1. Create Core Tables If Not Exist
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
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        slug VARCHAR(500) UNIQUE NOT NULL,
        tagline TEXT,
        description TEXT,
        key_features JSONB,
        specs JSONB,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        brand VARCHAR(100),
        badge VARCHAR(100),
        price NUMERIC(10, 2) NOT NULL,
        sale_price NUMERIC(10, 2),
        discount_percentage INT DEFAULT 0,
        stock_quantity INT DEFAULT 50,
        is_in_stock BOOLEAN DEFAULT true,
        sku VARCHAR(100),
        rating_average NUMERIC(3, 2) DEFAULT 5.0,
        rating_count INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT false,
        is_trending BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

    // 2. Ensure Admin User Exists
    const adminHash = bcrypt.hashSync('admin123', 10);
    await client.query(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING;
    `, ['Dkart Official Admin', 'admindkart@gmail.com', adminHash, '+92 342 5097760', 'admin']);

    // 3. Ensure Categories Exist
    const categories = [
      { name: 'Hair Styling & Care', slug: 'hair-styling', desc: 'Premium blow dryers, hair straighteners, curlers & styling brushes.' },
      { name: 'Personal Care & Grooming', slug: 'personal-care', desc: 'Painless shavers, trimmers, skin rejuvenators and body care.' },
      { name: 'Household Items', slug: 'household-items', desc: 'Premium kitchenware, cookware & essential home appliances.' },
      { name: 'Smart Lifestyle Tech', slug: 'smart-tech', desc: 'Smartwatches, wireless earbuds and everyday life innovations.' }
    ];

    for (const c of categories) {
      await client.query(`
        INSERT INTO categories (name, slug, description, is_featured)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (slug) DO NOTHING;
      `, [c.name, c.slug, c.desc]);
    }

    // 4. Ensure Coupons Exist
    await client.query(`
      INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
      VALUES ('DKART10', 'percentage', 10, 2000, true),
             ('WELCOME500', 'fixed', 500, 3000, true)
      ON CONFLICT (code) DO NOTHING;
    `);

    // 5. Check if products exist - PRESERVE CUSTOM DATA & PREVENT DESTRUCTIVE OVERWRITES
    const countRes = await client.query('SELECT COUNT(*) FROM products');
    const prodCount = parseInt(countRes.rows[0]?.count || '0', 10);

    if (prodCount > 0) {
      console.log(`ℹ️ Supabase contains ${prodCount} products. Skipping destructive overwrite to preserve all latest product changes.`);
      return;
    }

    console.log('🌱 Database is empty. Seeding initial catalog...');

    const catRes = await client.query('SELECT id, slug FROM categories');
    const catMap = {};
    catRes.rows.forEach(r => { catMap[r.slug] = r.id; });

    // Seed Helper (Only called if database is completely empty)
    async function seedProduct({ title, slug, tagline, description, keyFeatures, specs, catSlug, brand, badge, price, salePrice, stock, sku, images, variants, reviews }) {
      const catId = catMap[catSlug] || 1;
      const discount = salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;

      const pRes = await client.query(`
        INSERT INTO products (
          title, slug, tagline, description, key_features, specs, category_id,
          brand, badge, price, sale_price, discount_percentage, stock_quantity,
          is_in_stock, sku, rating_average, rating_count, is_featured, is_trending
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true, $14, 5.0, $15, true, true)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id;
      `, [
        title, slug, tagline, description, JSON.stringify(keyFeatures), JSON.stringify(specs),
        catId, brand, badge, price, salePrice, discount, stock, sku, reviews.length
      ]);

      if (!pRes.rows[0]) return;
      const prodId = pRes.rows[0].id;

      for (let i = 0; i < images.length; i++) {
        await client.query(`
          INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [prodId, images[i], title, i === 0, i]);
      }

      for (const v of variants) {
        await client.query(`
          INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [prodId, v.type || 'color', v.name, v.priceModifier || 0, v.stock || 50, v.image || images[0]]);
      }

      for (const r of reviews) {
        await client.query(`
          INSERT INTO reviews (product_id, user_name, rating, comment, city, images, verified_purchase)
          VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [prodId, r.name, r.rating, r.comment, r.city, JSON.stringify(r.images || [])]);
      }
    }

    console.log('✅ Supabase non-destructive initialization complete.');
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
