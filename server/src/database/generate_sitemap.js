import pg from 'pg';
import fs from 'fs';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function buildSitemap() {
  const client = await pool.connect();
  try {
    const pRes = await client.query('SELECT slug, created_at FROM products WHERE is_in_stock = true ORDER BY id ASC');
    const cRes = await client.query('SELECT slug FROM categories ORDER BY id ASC');

    const today = new Date().toISOString().split('T')[0];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Core Store Pages -->
  <url>
    <loc>https://www.dkart.pk/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.dkart.pk/shop</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://www.dkart.pk/track-order</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Categories -->
`;

    for (const cat of cRes.rows) {
      xml += `  <url>
    <loc>https://www.dkart.pk/shop?category=${cat.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
`;
    }

    xml += `\n  <!-- Live Products -->\n`;

    for (const prod of pRes.rows) {
      const pDate = prod.updated_at ? new Date(prod.updated_at).toISOString().split('T')[0] : today;
      xml += `  <url>
    <loc>https://www.dkart.pk/product/${prod.slug}</loc>
    <lastmod>${pDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
    }

    xml += `</urlset>\n`;

    fs.writeFileSync('D:/ML/Dkart Business/Dkart Store/client/public/sitemap.xml', xml);
    console.log(`✅ Generated sitemap.xml with ${pRes.rows.length} products and ${cRes.rows.length} categories!`);
  } finally {
    client.release();
    await pool.end();
  }
}

buildSitemap().catch(console.error);
