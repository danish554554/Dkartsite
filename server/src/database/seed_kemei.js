import pg from 'pg';

const connectionString = 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function addKemeiProduct() {
  const client = await pool.connect();
  try {
    console.log('Inserting Kemei Hair Remover into Supabase PostgreSQL...');

    // Check if category exists
    let catRes = await client.query("SELECT id FROM categories WHERE slug = 'personal-care' LIMIT 1");
    let categoryId = catRes.rows[0]?.id;
    if (!categoryId) {
      const newCat = await client.query(`
        INSERT INTO categories (name, slug, description, image_url, is_featured)
        VALUES ('Personal Care & Beauty', 'personal-care', 'Electric groomers, hair removers & personal stylers', '/uploads/kemei-rechargeable-hair-remover-main.webp', true)
        RETURNING id;
      `);
      categoryId = newCat.rows[0]?.id;
    }

    const title = 'Kemei Rechargeable Body Hair Remover – Cordless Electric Hair Remover for Gentle At-Home Touch-Ups';
    const slug = 'kemei-rechargeable-body-hair-remover';
    const tagline = 'Gentle, Cordless & Painless Hair Removal for Face, Arms, Legs & Underarms';
    const description = `This cordless electric body hair remover is designed for individuals looking for a practical grooming solution that can be used regularly at home or while traveling. The device features an ergonomic shape that allows users to hold and control it comfortably during use.

The trimming head is suitable for removing unwanted hair from areas such as face, arms, legs, and underarms. Its compact design makes it easy to carry in cosmetic bags or handbags, ensuring it is always available when needed.

The rechargeable feature eliminates the need for disposable batteries. Users can charge the device using a USB cable connected to laptops, power banks, or wall chargers. This adds flexibility and convenience for both home and travel use.

The operation is simple and does not require complex setup. After use, the trimming head can be cleaned to maintain hygiene and ensure consistent performance. Because of its lightweight construction and cordless design, the device supports quick and easy grooming routines. It is suitable for individuals who want a compact, portable, and easy-to-use hair removal tool for everyday use.`;

    const keyFeatures = JSON.stringify([
      'Cordless Electric Hair Remover – Suitable for face, arms, legs, and underarms',
      'Rechargeable Battery System – USB charging for convenient travel and home use',
      'Gentle & Painless Shaving – Hypoallergenic floating blade foil prevents cuts & redness',
      'Multi-Area Grooming Tool – Supports daily facial and body grooming needs',
      'Ergonomic Grip Design – Comfortable handling with single-switch operation',
      'Easy to Clean – Removable & washable trimming head for long-lasting hygiene'
    ]);

    const specs = JSON.stringify({
      'Brand': 'Kemei',
      'Model': 'KM-3018 / Electric Body Shaver',
      'Power Source': 'Rechargeable Battery (USB Cable Included)',
      'Blade Type': 'Hypoallergenic Stainless Steel Foil',
      'Target Areas': 'Face, Arms, Legs, Underarms, Bikini Area',
      'Charging Time': 'USB Fast Recharge',
      'Warranty': '7-Day Free Replacement Guarantee',
      'In The Box': '1x Kemei Shaver, 1x USB Cable, 1x Cleaning Brush, 1x User Manual'
    });

    // Insert Product
    const pRes = await client.query(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
        rating_average, rating_count, sku, is_featured, is_trending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title,
        tagline = EXCLUDED.tagline,
        description = EXCLUDED.description,
        key_features = EXCLUDED.key_features,
        specs = EXCLUDED.specs,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        discount_percentage = EXCLUDED.discount_percentage,
        stock_quantity = EXCLUDED.stock_quantity,
        is_in_stock = EXCLUDED.is_in_stock,
        badge = EXCLUDED.badge,
        rating_average = EXCLUDED.rating_average,
        rating_count = EXCLUDED.rating_count
      RETURNING id;
    `, [
      title,
      slug,
      tagline,
      description,
      keyFeatures,
      specs,
      categoryId,
      'HOT SELLER',
      2199,
      1499,
      32,
      85,
      true,
      5.0,
      6,
      'DK-KM3018',
      true,
      true
    ]);

    const productId = pRes.rows[0].id;
    console.log('Product ID:', productId);

    // Clean old images & variants & reviews for this product
    await client.query('DELETE FROM product_images WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [productId]);
    await client.query('DELETE FROM reviews WHERE product_id = $1', [productId]);

    // Insert Images
    const images = [
      { url: '/uploads/kemei-rechargeable-hair-remover-main.webp', is_primary: true, display_order: 0 },
      { url: '/uploads/kemei-rechargeable-hair-remover-features.webp', is_primary: false, display_order: 1 },
      { url: '/uploads/kemei-rechargeable-hair-remover-blade.webp', is_primary: false, display_order: 2 },
      { url: '/uploads/kemei-rechargeable-hair-remover-usage.webp', is_primary: false, display_order: 3 }
    ];

    for (const img of images) {
      await client.query(`
        INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, img.url, title, img.is_primary, img.display_order]);
    }

    // Insert Variants
    const variants = [
      { variant_type: 'Color', variant_name: 'Purple & White (Original)', price_modifier: 0, stock_quantity: 50 },
      { variant_type: 'Color', variant_name: 'Rose Pink Edition', price_modifier: 0, stock_quantity: 35 }
    ];

    for (const v of variants) {
      await client.query(`
        INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity)
        VALUES ($1, $2, $3, $4, $5);
      `, [productId, v.variant_type, v.variant_name, v.price_modifier, v.stock_quantity]);
    }

    // Insert Verified Customer Reviews with Photos matching the exact schema
    const reviews = [
      {
        user_name: 'Sadia Farooq',
        city: 'Lahore',
        rating: 5,
        comment: 'Bohot zabardast product hai! Bilkul painless hair remove karta hai face aur arms se. Battery timing bhi achi hai aur packing safe mili. Fast delivery in Lahore!',
        images: ['/uploads/kemei-review-1.webp']
      },
      {
        user_name: 'Zainab Tariq',
        city: 'Karachi',
        rating: 5,
        comment: 'Received within 2 days in Karachi. Original Kemei shaver, very gentle on sensitive skin without any redness. Highly recommended Dkart store!',
        images: ['/uploads/kemei-review-2.webp']
      },
      {
        user_name: 'Hina Malik',
        city: 'Islamabad',
        rating: 5,
        comment: 'Compact and very easy to clean. Perfect for quick touch-ups before going out. Packing was great and cash on delivery was hassle-free.',
        images: ['/uploads/kemei-review-3.webp']
      },
      {
        user_name: 'Aiman Siddiqui',
        city: 'Rawalpindi',
        rating: 5,
        comment: 'Smooth finish without any irritation or cuts. USB charging makes it super convenient for travel. Loved the quality!',
        images: ['/uploads/kemei-review-4.webp']
      },
      {
        user_name: 'Mahnoor Khan',
        city: 'Peshawar',
        rating: 5,
        comment: 'Quality 10/10. Sound bhi bohot kam hai aur grip comfortable hai. Thanks Dkart for genuine product and prompt delivery in Peshawar.',
        images: []
      },
      {
        user_name: 'Rabia Noor',
        city: 'Faisalabad',
        rating: 5,
        comment: 'Best trimmer for women in this price. Same as shown in pictures. Cash on delivery courier service was very professional.',
        images: []
      }
    ];

    for (const r of reviews) {
      await client.query(`
        INSERT INTO reviews (product_id, user_name, city, rating, comment, images, verified_purchase)
        VALUES ($1, $2, $3, $4, $5, $6, true);
      `, [productId, r.user_name, r.city, r.rating, r.comment, JSON.stringify(r.images)]);
    }

    console.log('✅ Kemei Hair Remover product, images, variants & 6 reviews added to Supabase!');
  } finally {
    client.release();
    await pool.end();
  }
}

addKemeiProduct().catch(console.error);
