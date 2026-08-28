import { db, initDatabase } from '../database/db.js';

async function seedKemei() {
  initDatabase();

  // 1. Local Database
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get('kemei-body-hair-remover');
  if (!existing) {
    const personalCat = db.prepare('SELECT id FROM categories WHERE slug = ?').get('personal-care');
    const catId = personalCat ? personalCat.id : 2;

    const info = db.prepare(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id, brand,
        badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
        sku, rating_average, rating_count, is_featured, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'Kemie Rechargeable Body Hair Remover – Cordless Electric Hair Remover for Gentle At-Home Touch-Ups',
      'kemei-body-hair-remover',
      'Cordless electric hair remover engineered for painless, gentle grooming across face, arms, legs, and bikini line.',
      'Experience salon-level smoothness at home with the Kemie Rechargeable Cordless Body Hair Remover. Engineered specifically for modern women seeking a gentle, irritation-free grooming solution, this cordless electric shaver glides effortlessly across contours to remove unwanted hair quickly without cuts, pulling, or razor burns.\n\nFeaturing an ergonomic curved grip and hypoallergenic micro-foil precision blades, it is safe and comfortable for multi-area grooming including the face, upper lip, arms, legs, underarms, and sensitive bikini zones. The USB rechargeable battery system provides powerful cordless performance at home or on the go, eliminating the hassle of disposable batteries.\n\nWith a detachable, washable grooming head and ultra-compact travel design, the Kemie Body Hair Remover is the ultimate essential for quick daily touch-ups and flawless skin.',
      JSON.stringify([
        'Cordless Gentle Grooming: Painless electric shaver designed for sensitive skin without pulling, nicks, or redness.',
        'Multi-Area Body & Facial Care: Suitable for face, upper lip, chin, arms, legs, underarms, and bikini area.',
        'USB Rechargeable Battery: Built-in high-capacity rechargeable battery for convenient cordless use anywhere.',
        'Hypoallergenic Stainless Blades: Ultra-thin precision foil protects delicate skin while cutting hair close to the surface.',
        'Ergonomic Curved Grip: Fits naturally in hand for maximum control and comfortable maneuvering around curves.',
        'Easy to Clean & Maintain: Detachable trimming head easily rinses under water to maintain hygiene.',
        'Compact & Travel-Ready: Lightweight, sleek pocket size easily fits into cosmetic pouches and handbags.',
        'Cash on Delivery Nationwide: 100% genuine guaranteed with fast 2-4 day express delivery across Pakistan.'
      ]),
      JSON.stringify({
        'Product Name': 'Kemei Rechargeable Body Hair Remover',
        'Model': 'KM-3018 Electric Lady Shaver',
        'Color Edition': 'Purple & White Standard',
        'Power Source': 'USB Rechargeable Battery',
        'Charging Time': 'Approximately 2 Hours',
        'Operating Time': 'Up to 50 Minutes Cordless Grooming',
        'Blade Type': 'Hypoallergenic Stainless Steel Foil',
        'Cleaning': 'Detachable Washable Head with Cleaning Brush',
        'In The Box': '1x Kemei Hair Remover, 1x Protective Cap, 1x USB Cable, 1x Cleaning Brush, 1x User Manual'
      }),
      catId,
      'Kemei',
      'Top Rated',
      2899,
      2299,
      21,
      60,
      1,
      'DK-KEMEI-03',
      5.0,
      6,
      1,
      1
    );

    const pid = info.lastInsertRowid;
    const insertImg = db.prepare('INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES (?, ?, ?, ?, ?)');
    [
      { url: '/uploads/kemei-hair-remover-main.webp', alt: 'Kemei Main View', isPrimary: 1, order: 1 },
      { url: '/uploads/kemei-hair-remover-features.webp', alt: 'Feature Highlights', isPrimary: 0, order: 2 },
      { url: '/uploads/kemei-hair-remover-cordless.webp', alt: 'Cordless USB System', isPrimary: 0, order: 3 },
      { url: '/uploads/kemei-hair-remover-blades.webp', alt: 'Precision Foil Blades', isPrimary: 0, order: 4 },
      { url: '/uploads/kemei-hair-remover-lifestyle.webp', alt: 'Multi-Area Grooming', isPrimary: 0, order: 5 },
      { url: '/uploads/kemei-hair-remover-packaging.webp', alt: 'Product Packaging', isPrimary: 0, order: 6 }
    ].forEach((img) => insertImg.run(pid, img.url, img.alt, img.isPrimary, img.order));

    db.prepare('INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity, image_url) VALUES (?, ?, ?, ?, ?, ?)').run(
      pid,
      'color',
      'Purple & White Standard',
      0,
      60,
      '/uploads/kemei-hair-remover-main.webp'
    );

    const insertRev = db.prepare('INSERT INTO reviews (product_id, user_name, rating, comment, city, images, verified_purchase) VALUES (?, ?, ?, ?, ?, ?, 1)');
    [
      { name: 'Sobia Akhtar', rating: 5, city: 'Lahore', comment: 'Bohot zabardast product hai! Bilkul pain nahi hota aur skin bohot smooth ho jati hai. Packing aur delivery b bohot fast thi.', images: ['/uploads/kemei-hair-remover-unboxing1.webp'] },
      { name: 'Mehak Fatima', rating: 5, city: 'Karachi', comment: 'Same as picture and original Kemei! Rechargeable hai aur battery timing b achi hai. 2 din me deliver hogya. Highly recommended!', images: ['/uploads/kemei-hair-remover-unboxing2.webp'] },
      { name: 'Hafsa Naveed', rating: 5, city: 'Islamabad', comment: 'Face aur arms k liye best device hai. Waxing se rashes hoty thay lekin is se skin bilkul saaf ho jati hai bina kisi dard k.', images: [] },
      { name: 'اقصیٰ رحمان', rating: 5, city: 'Faisalabad', comment: 'بہت ہی معیاری اور مفید پراڈکٹ ہے۔ چارجنگ بہت جلدی ہوتی ہے اور استعمال میں بہت آرام دہ ہے۔ ڈی کارٹ کا بہت شکریہ۔', images: [] },
      { name: 'Bushra Malik', rating: 5, city: 'Rawalpindi', comment: '100% original product ha. Compact hai to handbag me asani se aa jata hai travel k liye.', images: [] },
      { name: 'Tayyaba Noor', rating: 5, city: 'Multan', comment: 'Delivery bohat fast thi aur parcel achi tarah pack tha. 5/5 Stars for quality and service!', images: [] }
    ].forEach((rev) => insertRev.run(pid, rev.name, rev.rating, rev.comment, rev.city, JSON.stringify(rev.images)));

    console.log('✅ Local SQLite Kemei product & reviews seeded.');
  }

  // 2. Render Deployment
  console.log('Attempting to create Product 3 on Render...');
  let loginRes = await fetch('https://dkartsite.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admindkart@gmail.com', password: 'admin123' })
  });
  let token;
  if (loginRes.ok) {
    token = (await loginRes.json()).token;
  } else {
    let l2 = await fetch('https://dkartsite.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@dkart.pk', password: 'admin123' })
    });
    token = (await l2.json()).token;
  }

  const p3Payload = {
    title: 'Kemie Rechargeable Body Hair Remover – Cordless Electric Hair Remover for Gentle At-Home Touch-Ups',
    slug: 'kemei-body-hair-remover',
    tagline: 'Cordless electric hair remover engineered for painless, gentle grooming across face, arms, legs, and bikini line.',
    description: 'Experience salon-level smoothness at home with the Kemie Rechargeable Cordless Body Hair Remover. Engineered specifically for modern women seeking a gentle, irritation-free grooming solution, this cordless electric shaver glides effortlessly across contours to remove unwanted hair quickly without cuts, pulling, or razor burns.',
    categoryId: 2,
    brand: 'Kemei',
    badge: 'Top Rated',
    price: 2899,
    salePrice: 2299,
    stockQuantity: 60,
    sku: 'DK-KEMEI-03',
    ratingAverage: 5.0,
    ratingCount: 6,
    images: [
      { url: '/uploads/kemei-hair-remover-main.webp', is_primary: true },
      { url: '/uploads/kemei-hair-remover-features.webp', is_primary: false },
      { url: '/uploads/kemei-hair-remover-cordless.webp', is_primary: false },
      { url: '/uploads/kemei-hair-remover-blades.webp', is_primary: false },
      { url: '/uploads/kemei-hair-remover-lifestyle.webp', is_primary: false },
      { url: '/uploads/kemei-hair-remover-packaging.webp', is_primary: false }
    ],
    variants: [{ variant_type: 'color', variant_name: 'Purple & White Standard', price_modifier: 0, stock_quantity: 60 }]
  };

  const r3 = await fetch('https://dkartsite.onrender.com/api/admin/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(p3Payload)
  });
  console.log('Render P3 Created:', await r3.json());
}

seedKemei().catch(console.error);
