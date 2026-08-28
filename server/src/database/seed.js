import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedData() {
  initDatabase();

  // 1. Ensure Admin User Exists
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@dkart.pk');
  if (!adminUser) {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Dkart Admin', 'admin@dkart.pk', adminPasswordHash, '+92 342 5097760', 'admin');
    console.log('✅ Admin user ready: admin@dkart.pk / admin123');
  }

  // 2. Ensure Categories Exist
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (categoryCount === 0) {
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
  }

  // 3. Ensure Banners Exist
  const bannerCount = db.prepare('SELECT COUNT(*) as count FROM banners').get().count;
  if (bannerCount === 0) {
    db.prepare(`
      INSERT INTO banners (title, subtitle, badge, cta_text, cta_link, image_url, position, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
  }

  // 4. Ensure Promotional Coupons Exist
  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get().count;
  if (couponCount === 0) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertCoupon.run('DKART10', 'percentage', 10, 2000, 1);
    insertCoupon.run('WELCOME500', 'fixed', 500, 4000, 1);
  }

  // 5. Remove all Demo SKUs and seed products so the catalog is clean for manual entries
  try {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM wishlist;
      DELETE FROM reviews;
      DELETE FROM product_variants;
      DELETE FROM product_images;
      DELETE FROM products WHERE sku LIKE 'DK-%' OR sku LIKE 'DEMO-%';
    `);
    db.pragma('foreign_keys = ON');
  } catch (err) {
    db.pragma('foreign_keys = ON');
    console.error('Demo SKU cleanup error:', err);
  }

  console.log('✅ Production store initialized. 0 demo products.');
}
