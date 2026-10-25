import fs from 'fs';
import path from 'path';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres.ptkybunorwwbejtbxsda:.%2FTQ%25L%2BRq%3Fs94sv@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

const categoryMap = {
  'hair-styling': 'Health & Beauty > Personal Care > Hair Care > Hair Styling Tools',
  'personal-care': 'Health & Beauty > Personal Care > Shaving & Grooming',
  'smart-tech': 'Electronics > Electronics Accessories > Mobile Phone Accessories',
  'household-items': 'Home & Garden > Kitchen & Dining > Cookware & Bakeware',
  'home-essentials': 'Home & Garden > Household Supplies'
};

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

function escapeCsv(val) {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function buildMetaCatalog() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id ASC
    `);

    const products = res.rows;
    console.log(`Fetched ${products.length} products for Meta Commerce Catalog.`);

    // 1. Build XML RSS 2.0 Feed
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>dKart Pakistan - Official Meta Commerce Catalog</title>
    <link>https://www.dkart.pk</link>
    <description>Product feed for Meta Commerce Manager, Facebook Shop, and Instagram Shopping in Pakistan (PKR)</description>
`;

    // 2. Build CSV Feed
    const csvHeaders = [
      'id',
      'title',
      'description',
      'availability',
      'condition',
      'price',
      'sale_price',
      'link',
      'image_link',
      'brand',
      'google_product_category',
      'fb_product_category'
    ];
    let csvRows = [csvHeaders.join(',')];

    for (const p of products) {
      const id = p.sku || `DKART-${p.id}`;
      const title = p.title;
      // Clean plain text description
      const desc = (p.description || p.tagline || p.title)
        .replace(/[\r\n]+/g, ' ')
        .trim();
      
      const availability = p.is_in_stock ? 'in stock' : 'out of stock';
      const condition = 'new';
      
      const regularPrice = Number(p.price || p.sale_price || 0).toFixed(2);
      const salePrice = p.sale_price ? Number(p.sale_price).toFixed(2) : null;
      
      const formattedPrice = `${regularPrice} PKR`;
      const formattedSalePrice = salePrice && Number(salePrice) < Number(regularPrice) ? `${salePrice} PKR` : null;

      const link = `https://www.dkart.pk/product/${p.slug}`;
      const imgPath = p.primary_image || '/logo.png';
      const imageLink = imgPath.startsWith('http') ? imgPath : `https://www.dkart.pk${imgPath}`;
      
      const brand = p.brand || 'dKart';
      const categoryPath = categoryMap[p.category_slug] || 'Health & Beauty > Personal Care';

      // XML Item
      xml += `    <item>
      <g:id>${escapeXml(id)}</g:id>
      <g:title>${escapeXml(title)}</g:title>
      <g:description>${escapeXml(desc)}</g:description>
      <g:link>${escapeXml(link)}</g:link>
      <g:image_link>${escapeXml(imageLink)}</g:image_link>
      <g:brand>${escapeXml(brand)}</g:brand>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${formattedPrice}</g:price>
`;
      if (formattedSalePrice) {
        xml += `      <g:sale_price>${formattedSalePrice}</g:sale_price>\n`;
      }
      xml += `      <g:google_product_category>${escapeXml(categoryPath)}</g:google_product_category>
      <g:fb_product_category>${escapeXml(categoryPath)}</g:fb_product_category>
    </item>
`;

      // CSV Row
      csvRows.push([
        escapeCsv(id),
        escapeCsv(title),
        escapeCsv(desc),
        escapeCsv(availability),
        escapeCsv(condition),
        escapeCsv(formattedPrice),
        escapeCsv(formattedSalePrice || ''),
        escapeCsv(link),
        escapeCsv(imageLink),
        escapeCsv(brand),
        escapeCsv(categoryPath),
        escapeCsv(categoryPath)
      ].join(','));
    }

    xml += `  </channel>
</rss>`;

    const csv = csvRows.join('\n');

    // Target Directories to save
    const targets = [
      'D:/ML/Dkart Business/Dkart Store/client/public',
      'D:/ML/Dkart Business/Dkart Store/client/dist',
      'D:/ML/Dkart Business/Dkart Store/server/public'
    ];

    targets.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.writeFileSync(path.join(dir, 'meta-catalog.xml'), xml, 'utf8');
        fs.writeFileSync(path.join(dir, 'meta-catalog.csv'), csv, 'utf8');
        console.log(`Saved feeds to ${dir}`);
      }
    });

    console.log('✅ Meta Commerce Catalog feeds generated successfully!');
    return { xml, csv, productsCount: products.length };
  } finally {
    client.release();
  }
}

// If executed directly
if (process.argv[1] && process.argv[1].includes('generate_meta_catalog')) {
  buildMetaCatalog()
    .then(() => pool.end())
    .catch(err => {
      console.error(err);
      pool.end();
      process.exit(1);
    });
}
