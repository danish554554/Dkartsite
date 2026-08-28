import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedData() {
  initDatabase();

  // 1. Ensure Admin User Exists
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const mainAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admindkart@gmail.com');
  if (!mainAdmin) {
    db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Dkart Admin', 'admindkart@gmail.com', adminPasswordHash, '+92 342 5097760', 'admin');
    console.log('✅ Main Admin user ready: admindkart@gmail.com / admin123');
  }

  const legacyAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@dkart.pk');
  if (!legacyAdmin) {
    db.prepare(`
      INSERT INTO users (name, email, password_hash, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('Dkart Admin', 'admin@dkart.pk', adminPasswordHash, '+92 342 5097760', 'admin');
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
    insertCoupon.run('WELCOME500', 'fixed', 500, 3000, 1);
  }

  // 5. Ensure Official Live Products Exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    const hairCat = db.prepare("SELECT id FROM categories WHERE slug = 'hair-styling'").get();
    const personalCat = db.prepare("SELECT id FROM categories WHERE slug = 'personal-care'").get();

    const insertProd = db.prepare(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id, brand,
        badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
        sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImg = db.prepare(`
      INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertVar = db.prepare(`
      INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertRev = db.prepare(`
      INSERT INTO reviews (product_id, user_name, rating, comment, city, images, verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);

    // Product 1: Hair Dryer Brush
    const p1Info = insertProd.run(
      'Hair Dryer Brush 3 in 1 Hot Air Brush | Blow Dryer, Straightener & Volumizer for Hair Styling',
      '3-in-1-hair-dryer-brush',
      'Salon-grade blow dry, smooth straightening, and instant volume at home in under 10 minutes.',
      'Transform your daily hair routine with the One Step 3-in-1 Hair Dryer Brush. Combining the power of a professional blow dryer, the smoothing precision of a ceramic hair straightener, and the lift of a volumizing brush, this all-in-one hot air styling tool lets you achieve bouncy salon-quality blowouts effortlessly at home in half the time.\n\nEngineered with advanced Negative Ion Technology and 360° airflow vents, it saturates the airflow to condition and soften hair while eliminating frizz and static. The unique oval barrel design smooths the hair, while the gently rounded edges create gorgeous root volume and beautifully curled ends.',
      JSON.stringify([
        '3-in-1 Multipurpose Hair Tool: Blow dryer, ceramic straightener, and volumizer in one single step.',
        'Negative Ion Technology: Neutralizes static, seals cuticles, locks in moisture, and eliminates frizz for shiny, silky hair.',
        'Unique Oval Barrel Design: Smooths out frizz while rounded edges create lifted volume at the roots.',
        '3 Adjustable Heat & Speed Modes: Low, Medium, and High heat settings customized for all hair types.',
        'Tangle-Free Combination Bristles: Nylon pin bristles with ball tips gently massage the scalp.',
        'Ceramic Coating Protection: Distributes heat evenly across the barrel to protect hair from damage.',
        '360° Swivel Power Cord: Flexible, tangle-free salon cord allows effortless styling at any angle.',
        'Cash on Delivery Nationwide: Order with 100% confidence with fast 2-4 day delivery across Pakistan.'
      ]),
      JSON.stringify({
        'Product Type': '3-in-1 Hot Air Hair Dryer & Volumizer Brush',
        'Model': 'One Step Hair Styler Pro',
        'Power / Wattage': '1000W High Efficiency Motor',
        'Voltage': '220V - 240V ~ 50/60Hz (Standard Pakistani Socket)',
        'Heating Technology': 'Tourmaline Ceramic with Negative Ion Generator',
        'Heat / Speed Settings': '3 Modes (Cool / Low / High)',
        'Barrel Shape': 'Ergonomic Oval Brush Design',
        'Cord Length': '1.8m 360° Swivel Salon Cord',
        'In The Box': '1x One Step 3-in-1 Hair Dryer Brush, 1x User Manual, 1x Official Warranty Card'
      }),
      hairCat ? hairCat.id : 1,
      'One Step',
      'Hot Deal',
      2899,
      2399,
      17,
      75,
      1,
      'DK-ONESTEP-01',
      5.0,
      6,
      1,
      1
    );

    const p1Id = p1Info.lastInsertRowid;
    [
      { url: '/uploads/hair-dryer-brush-3-in-1-main.webp', alt: 'Main Brush View', isPrimary: 1, order: 1 },
      { url: '/uploads/hair-dryer-brush-3-in-1-styling.webp', alt: 'Styling in Action', isPrimary: 0, order: 2 },
      { url: '/uploads/hair-dryer-brush-3-in-1-features.webp', alt: 'Negative Ion Tech', isPrimary: 0, order: 3 },
      { url: '/uploads/hair-dryer-brush-3-in-1-volumizer.webp', alt: 'Oval Volumizer', isPrimary: 0, order: 4 },
      { url: '/uploads/hair-dryer-brush-3-in-1-airflow.webp', alt: 'Airflow Vents', isPrimary: 0, order: 5 },
      { url: '/uploads/hair-dryer-brush-3-in-1-packaging.webp', alt: 'Box Packaging', isPrimary: 0, order: 6 }
    ].forEach((img) => insertImg.run(p1Id, img.url, img.alt, img.isPrimary, img.order));

    insertVar.run(p1Id, 'color', 'Black & Pink', 0, 75, '/uploads/hair-dryer-brush-3-in-1-main.webp');

    [
      { name: 'Ayesha Khan', rating: 5, city: 'Lahore', comment: 'Bohat zabardast product hai, daily use k liye perfect hai. Hair dry aur smooth dono ho jate hain 8-10 minutes me! 100% recommended.', images: ['/uploads/hair-dryer-brush-3-in-1-main.webp'] },
      { name: 'Fatima Noor', rating: 5, city: 'Karachi', comment: 'Same as shown in pictures! Packing bht secure thi aur parcel 2 din me deliver hogya. Hair shiny aur silky ho jaty hain bina parlor k.', images: ['/uploads/hair-dryer-brush-3-in-1-packaging.webp', '/uploads/hair-dryer-brush-3-in-1-volumizer.webp'] },
      { name: 'Hira Tariq', rating: 5, city: 'Rawalpindi', comment: '100% recommended product hai. Parlor jany ki zaroorat he nahi rehti blowout k liye. Heat control bht acha hai.', images: [] },
      { name: 'مریم بی بی', rating: 5, city: 'Faisalabad', comment: 'بہت زبردست کوالٹی ہے۔ بال جلدی سوکھ جاتے ہیں اور بالکل سیدھے اور چمکدار ہو جاتے ہیں۔ شکریہ ڈی کارٹ!', images: [] },
      { name: 'Sidra Batool', rating: 5, city: 'Islamabad', comment: 'Best hair styler for working women. Subha subha 5 minute me hair set ho jatay hain.', images: [] },
      { name: 'Zainab Raza', rating: 5, city: 'Multan', comment: 'Alhamdulillah bohot achi product ha, original One Step brush ha. Heat bilkul perfect ha.', images: [] }
    ].forEach((rev) => insertRev.run(p1Id, rev.name, rev.rating, rev.comment, rev.city, JSON.stringify(rev.images)));

    // Product 2: Yes Finishing Touch
    const p2Info = insertProd.run(
      'Yes Finishing Rechargeable Hair Removal Shaver for Women – Facial, Bikini Line & Underarm Painless Electric Trimmer',
      'yes-finishing-hair-remover',
      'Instant, pain-free hair removal with smart Sensalight technology for smooth, glowing skin anywhere, anytime.',
      'Say goodbye to painful waxing, razors, and expensive parlor treatments with the Yes Finishing Touch Instant & Painless Hair Remover. Engineered with advanced Sensa-Light Technology, the device automatically activates micro-oscillation only when in direct contact with skin, removing unwanted hair from roots without nicks, burns, redness, or bumps.\n\nDesigned specifically for women delicate skin, it is ideal for full facial grooming (upper lips, chin, cheeks, sideburns), as well as sensitive body zones like underarms, arms, legs, and the bikini line. It features two interchangeable heads: a micro-foil head for short stubble and smooth finishing, and a trimmer head for longer hair.\n\nThe compact, USB rechargeable lithium-ion battery makes it travel-friendly and convenient for quick touch-ups on the go without requiring water, shaving cream, or soap.',
      JSON.stringify([
        'Smart Sensa-Light Technology: Automatically activates micro-vibration upon skin contact for safe, painless hair removal.',
        '100% Pain-Free & Gentle: No nicks, cuts, razor burns, redness, or irritation—dermatologist recommended for sensitive skin.',
        'Dual Interchangeable Heads: Includes a micro-foil head for ultra-close smooth finishing and a precision trimmer head for longer hair.',
        'Full Body & Facial Application: Perfect for upper lip, chin, peach fuzz, underarms, bikini line, arms, and legs.',
        'USB Rechargeable Battery: Built-in rechargeable Li-ion battery with included USB charging cable—no extra batteries needed.',
        'Built-in LED Illumination: Integrated light reveals even the finest peach fuzz so you never miss a spot.',
        'Compact & Portable: Elegant, lightweight pocket-sized design easily slips into your handbag or travel vanity pouch.',
        'Cash on Delivery Nationwide: 100% genuine product with 7-day replacement warranty and fast delivery across Pakistan.'
      ]),
      JSON.stringify({
        'Product Name': 'Yes Finishing Touch Rechargeable Hair Remover',
        'Model': 'Yes Instant Pain-Free Shaver Pro',
        'Power Source': 'USB Rechargeable (Built-in Lithium-Ion Battery)',
        'Technology': 'Active Sensa-Light Contact Sensor',
        'Heads Included': '1x Micro-Foil Head + 1x Trimmer Head',
        'Cleaning': 'Washable Removable Heads with Included Cleaning Brush',
        'Charging Time': 'Approximately 2 Hours for up to 60 Minutes use',
        'In The Box': '1x Yes Hair Remover Unit, 1x Micro-Foil Head, 1x Trimmer Head, 1x USB Cable, 1x Cleaning Brush, 1x Manual'
      }),
      personalCat ? personalCat.id : 2,
      'Yes Finishing Touch',
      'Bestseller',
      1799,
      1299,
      28,
      85,
      1,
      'DK-YES-02',
      5.0,
      6,
      1,
      1
    );

    const p2Id = p2Info.lastInsertRowid;
    [
      { url: '/uploads/yes-finishing-hair-remover-main.webp', alt: 'Yes Finishing Touch Main', isPrimary: 1, order: 1 },
      { url: '/uploads/yes-finishing-hair-remover-sensalight.webp', alt: 'Sensalight Tech', isPrimary: 0, order: 2 },
      { url: '/uploads/yes-finishing-hair-remover-application.webp', alt: 'Application Zones', isPrimary: 0, order: 3 },
      { url: '/uploads/yes-finishing-hair-remover-heads.webp', alt: 'Interchangeable Heads', isPrimary: 0, order: 4 },
      { url: '/uploads/yes-finishing-hair-remover-packaging.webp', alt: 'Packaging Box', isPrimary: 0, order: 5 }
    ].forEach((img) => insertImg.run(p2Id, img.url, img.alt, img.isPrimary, img.order));

    insertVar.run(p2Id, 'color', 'White & Purple Standard', 0, 85, '/uploads/yes-finishing-hair-remover-main.webp');

    [
      { name: 'Komal Shah', rating: 5, city: 'Lahore', comment: 'Bohot achi cheez hai, face k unwanted hairs bilkul pain-free remove ho jate hain. Light b chal jati hai jisse chote se chota bal b nazar ata hai.', images: ['/uploads/yes-finishing-hair-remover-main.webp'] },
      { name: 'Nadia Pervez', rating: 5, city: 'Karachi', comment: 'Same as shown in pictures! Daraz se b achi packing aur quality thi. Rechargeable hai to cell change krny ka jhanjhat b nahi. Highly recommended!', images: ['/uploads/yes-finishing-hair-remover-packaging.webp'] },
      { name: 'Amna Tariq', rating: 5, city: 'Islamabad', comment: 'Bht zabardast shaver hai sensitive skin k liye. Waxing se rashes hoty thay lekin is se skin bilkul soft aur clean ho jati hai.', images: ['/uploads/yes-finishing-hair-remover-heads.webp'] },
      { name: 'روبینہ کوثر', rating: 5, city: 'Faisalabad', comment: 'بہت ہی زبردست اور کام کی چیز ہے۔ استعمال کرنے میں بہت آسان اور درد بالکل نہیں ہوتا۔ کیش آن ڈلیوری پر جلدی مل گیا۔ شکریہ ڈی کارٹ!', images: [] },
      { name: 'Saba Rehman', rating: 5, city: 'Multan', comment: 'Delivery bht fast thi (2 days). Upper lips aur chin k liye best hai parlor k bar bar chakar khatam. 5/5 Stars!', images: [] },
      { name: 'Madiha Khan', rating: 5, city: 'Peshawar', comment: 'Bikini line aur underarms k liye perfect hai, razor cuts se bachat ho jati hai.', images: [] }
    ].forEach((rev) => insertRev.run(p2Id, rev.name, rev.rating, rev.comment, rev.city, JSON.stringify(rev.images)));

    console.log('✅ Official products & reviews seeded successfully.');
  }

  console.log('Database seeding process completed.');
}
