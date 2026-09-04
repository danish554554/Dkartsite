import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function exportInitial() {
  const client = await pool.connect();
  try {
    const pRes = await client.query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image,
        (SELECT count(*) FROM reviews WHERE product_id = p.id) as actual_review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);

    const cRes = await client.query('SELECT * FROM categories ORDER BY id ASC');

    const formattedProducts = pRes.rows.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      category_id: p.category_id,
      category_name: p.category_name,
      category_slug: p.category_slug,
      price: Number(p.price),
      sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
      discount_percentage: Number(p.discount_percentage || 0),
      badge: p.badge,
      stock_quantity: Number(p.stock_quantity || 50),
      is_in_stock: Boolean(p.is_in_stock),
      rating_average: Number(p.rating_average || 5),
      rating_count: Number(p.actual_review_count || p.rating_count || 6),
      actual_review_count: Number(p.actual_review_count || 6),
      primary_image: p.primary_image || '/uploads/hair-dryer-brush-3-in-1-main.webp',
      is_featured: Boolean(p.is_featured),
      is_trending: Boolean(p.is_trending)
    }));

    const formattedCategories = cRes.rows.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      image_url: c.image_url || '/uploads/hair-dryer-brush-3-in-1-main.webp',
      product_count: 10
    }));

    const content = `// Auto-generated instant cache for instant 0ms page loads
export const INITIAL_PRODUCTS = ${JSON.stringify(formattedProducts, null, 2)};

export const INITIAL_CATEGORIES = ${JSON.stringify(formattedCategories, null, 2)};
`;

    const dataDir = 'D:/ML/Dkart Business/Dkart Store/client/src/data';
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(dataDir + '/initialCatalog.js', content);
    console.log('✅ Created initialCatalog.js with', formattedProducts.length, 'products and', formattedCategories.length, 'categories!');
  } finally {
    client.release();
    await pool.end();
  }
}

exportInitial().catch(console.error);
