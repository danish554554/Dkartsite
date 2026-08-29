import { query, queryOne, queryAll, execute } from '../database/db.js';

export const getAnalytics = async (req, res) => {
  try {
    const totalSalesRow = await queryOne("SELECT SUM(total_amount) as total FROM orders WHERE order_status != 'Cancelled'");
    const totalSales = Number(totalSalesRow?.total || 0);

    const totalOrdersRow = await queryOne('SELECT COUNT(*) as count FROM orders');
    const totalOrders = parseInt(totalOrdersRow?.count || 0, 10);

    const pendingOrdersRow = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Pending' OR order_status = 'Processing' OR order_status = 'Confirmed'");
    const pendingOrders = parseInt(pendingOrdersRow?.count || 0, 10);

    const deliveredOrdersRow = await queryOne("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'");
    const deliveredOrders = parseInt(deliveredOrdersRow?.count || 0, 10);

    const totalProductsRow = await queryOne('SELECT COUNT(*) as count FROM products');
    const totalProducts = parseInt(totalProductsRow?.count || 0, 10);

    const lowStockProductsRow = await queryOne('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 10');
    const lowStockProducts = parseInt(lowStockProductsRow?.count || 0, 10);

    const totalCustomersRow = await queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const totalCustomers = parseInt(totalCustomersRow?.count || 0, 10);

    const recentOrders = await queryAll(`
      SELECT id, customer_name, customer_phone, total_amount, order_status, payment_method, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 6
    `);

    const topProducts = await queryAll(`
      SELECT p.id, p.title, p.price, p.sale_price, p.stock_quantity,
        (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image,
        COALESCE(SUM(oi.quantity), 0) as units_sold
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        totalProducts,
        lowStockProducts,
        totalCustomers,
        recentOrders: recentOrders.map(o => ({ ...o, total_amount: Number(o.total_amount) })),
        topProducts: topProducts.map(p => ({ ...p, price: Number(p.price), sale_price: p.sale_price !== null ? Number(p.sale_price) : null, units_sold: Number(p.units_sold) }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await queryAll(`
      SELECT 
        p.*, 
        c.name as category_name,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);

    const fullProducts = await Promise.all(products.map(async (p) => {
      const images = await queryAll('SELECT id, url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC', [p.id]);
      const variants = await queryAll('SELECT id, variant_type, variant_name, price_modifier, stock_quantity FROM product_variants WHERE product_id = ?', [p.id]);
      return {
        ...p,
        price: Number(p.price),
        sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
        key_features: Array.isArray(p.key_features) ? p.key_features : (typeof p.key_features === 'string' ? JSON.parse(p.key_features) : []),
        specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (typeof p.specs === 'string' ? JSON.parse(p.specs) : {}),
        images,
        variants: variants.map(v => ({ ...v, price_modifier: Number(v.price_modifier || 0) }))
      };
    }));

    res.json({ success: true, data: fullProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      tagline,
      description,
      categoryId,
      price,
      salePrice,
      stockQuantity,
      badge,
      sku,
      images = [],
      variants = [],
      keyFeatures = [],
      specs = {}
    } = req.body;

    if (!title || !price || !description) {
      return res.status(400).json({ success: false, message: 'Title, price, and description are required.' });
    }

    const slug = req.body.slug
      ? req.body.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-')
      : (title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    const regularPrice = parseFloat(price);
    const sPrice = salePrice ? parseFloat(salePrice) : null;
    const discount = sPrice && sPrice < regularPrice ? Math.round(((regularPrice - sPrice) / regularPrice) * 100) : 0;
    const stock = parseInt(stockQuantity, 10) || 25;

    const result = await execute(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
        sku, is_featured, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, false)
      RETURNING id
    `, [
      title.trim(),
      slug,
      tagline || '',
      description.trim(),
      JSON.stringify(keyFeatures),
      JSON.stringify(specs),
      categoryId || null,
      badge || null,
      regularPrice,
      sPrice,
      discount,
      stock,
      stock > 0,
      sku || `DK-${Math.floor(1000 + Math.random() * 9000)}`
    ]);

    const productId = result.rows[0]?.id;

    // Save Images
    if (Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const url = typeof img === 'string' ? img : img.url;
        const isPrimary = typeof img === 'object' && img.is_primary !== undefined ? Boolean(img.is_primary) : i === 0;
        await execute('INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES (?, ?, ?, ?, ?)', [productId, url, title, isPrimary, i]);
      }
    }

    // Save Variants
    if (Array.isArray(variants) && variants.length > 0) {
      for (const v of variants) {
        await execute('INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity) VALUES (?, ?, ?, ?, ?)', [
          productId,
          v.variant_type || 'color',
          v.variant_name,
          Number(v.price_modifier || 0),
          Number(v.stock_quantity || 20)
        ]);
      }
    }

    res.status(201).json({ success: true, message: 'Product created successfully with all images and variants!', id: productId, slug });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await queryOne('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const {
      title = existing.title,
      slug = req.body.slug || existing.slug,
      tagline = existing.tagline,
      description = existing.description,
      categoryId = existing.category_id,
      price = existing.price,
      salePrice = existing.sale_price,
      stockQuantity = existing.stock_quantity,
      badge = existing.badge,
      sku = existing.sku,
      brand = existing.brand,
      isFeatured = existing.is_featured,
      isTrending = existing.is_trending,
      images,
      variants,
      keyFeatures,
      specs
    } = req.body;

    const regularPrice = parseFloat(price);
    const sPrice = salePrice !== undefined && salePrice !== '' && salePrice !== null ? parseFloat(salePrice) : null;
    const discount = sPrice && sPrice < regularPrice ? Math.round(((regularPrice - sPrice) / regularPrice) * 100) : 0;
    const stock = parseInt(stockQuantity, 10) || 0;

    const cleanSlug = slug ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') : existing.slug;

    await execute(`
      UPDATE products
      SET 
        title = ?,
        slug = ?,
        tagline = ?,
        description = ?,
        category_id = ?,
        brand = ?,
        price = ?,
        sale_price = ?,
        discount_percentage = ?,
        stock_quantity = ?,
        is_in_stock = ?,
        badge = ?,
        sku = ?,
        key_features = COALESCE(?, key_features),
        specs = COALESCE(?, specs),
        is_featured = ?,
        is_trending = ?,
        rating_average = COALESCE(?, rating_average),
        rating_count = COALESCE(?, rating_count)
      WHERE id = ?
    `, [
      title, cleanSlug, tagline, description,
      categoryId || null,
      brand || 'Dkart',
      regularPrice, sPrice, discount, stock, stock > 0,
      badge || null, sku,
      keyFeatures ? JSON.stringify(keyFeatures) : null,
      specs ? JSON.stringify(specs) : null,
      Boolean(isFeatured),
      Boolean(isTrending),
      req.body.ratingAverage !== undefined ? req.body.ratingAverage : null,
      req.body.ratingCount !== undefined ? req.body.ratingCount : null,
      id
    ]);

    // Update images if provided
    if (Array.isArray(images)) {
      await execute('DELETE FROM product_images WHERE product_id = ?', [id]);
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const url = typeof img === 'string' ? img : img.url;
        const isPrimary = typeof img === 'object' && img.is_primary !== undefined ? Boolean(img.is_primary) : i === 0;
        await execute('INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES (?, ?, ?, ?, ?)', [id, url, title || 'Product Image', isPrimary, i]);
      }
    }

    // Update variants if provided
    if (Array.isArray(variants)) {
      await execute('DELETE FROM product_variants WHERE product_id = ?', [id]);
      for (const v of variants) {
        await execute('INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity) VALUES (?, ?, ?, ?, ?)', [
          id,
          v.variant_type || 'color',
          v.variant_name,
          Number(v.price_modifier || 0),
          Number(v.stock_quantity || 20)
        ]);
      }
    }

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

export const clearAllProducts = async (req, res) => {
  try {
    await execute('DELETE FROM products');
    res.json({ success: true, message: 'All products cleared successfully.' });
  } catch (error) {
    console.error('Clear products error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear products.' });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'All' && status !== 'undefined') {
      sql += ' AND order_status = ?';
      params.push(status);
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      sql += ' AND (id ILIKE ? OR customer_name ILIKE ? OR customer_phone ILIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY created_at DESC';

    const orders = await queryAll(sql, params);
    const fullOrders = await Promise.all(orders.map(async (o) => {
      let parsedAddress = o.shipping_address;
      if (typeof o.shipping_address === 'string') {
        try {
          parsedAddress = JSON.parse(o.shipping_address);
        } catch {
          parsedAddress = { address: o.shipping_address };
        }
      }
      const items = await queryAll('SELECT * FROM order_items WHERE order_id = ?', [o.id]);
      return {
        ...o,
        subtotal: Number(o.subtotal),
        discount_amount: Number(o.discount_amount),
        shipping_fee: Number(o.shipping_fee),
        total_amount: Number(o.total_amount),
        shipping_address: parsedAddress,
        items: items.map(i => ({ ...i, unit_price: Number(i.unit_price), subtotal: Number(i.subtotal) }))
      };
    }));

    res.json({ success: true, data: fullOrders });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    await execute(`
      UPDATE orders
      SET order_status = ?, tracking_number = COALESCE(?, tracking_number)
      WHERE id = ?
    `, [status, trackingNumber || null, id]);

    res.json({ success: true, message: `Order status updated to "${status}".` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const getInventory = async (req, res) => {
  try {
    const items = await queryAll(`
      SELECT 
        p.id, p.title, p.sku, p.stock_quantity, p.price, p.sale_price,
        c.name as category_name,
        (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.stock_quantity ASC
    `);

    res.json({ success: true, data: items.map(p => ({ ...p, price: Number(p.price), sale_price: p.sale_price !== null ? Number(p.sale_price) : null })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve inventory.' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const qty = parseInt(stockQuantity, 10);

    await execute(`
      UPDATE products
      SET stock_quantity = ?, is_in_stock = ?
      WHERE id = ?
    `, [qty, qty > 0, id]);

    res.json({ success: true, message: 'Stock updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inventory.' });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await queryAll(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json({ success: true, data: customers.map(c => ({ ...c, total_orders: Number(c.total_orders), total_spent: Number(c.total_spent) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
};

export const getAdminBanners = async (req, res) => {
  try {
    const banners = await queryAll('SELECT * FROM banners ORDER BY id ASC');
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve banners.' });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { title, subtitle, imageUrl, linkUrl } = req.body;
    await execute(`
      INSERT INTO banners (title, subtitle, image_url, link_url, is_active)
      VALUES (?, ?, ?, ?, true)
    `, [title, subtitle, imageUrl, linkUrl || '/shop']);

    res.status(201).json({ success: true, message: 'Banner created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner.' });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM banners WHERE id = ?', [id]);
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, imageUrl, isFeatured = true } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = await execute(`
      INSERT INTO categories (name, slug, description, image_url, is_featured)
      VALUES (?, ?, ?, ?, ?)
      RETURNING id
    `, [name.trim(), slug, description || '', imageUrl || '', Boolean(isFeatured)]);

    res.status(201).json({ success: true, message: 'Category created.', id: result.rows[0]?.id });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

export const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await queryAll('SELECT * FROM coupons ORDER BY id DESC');
    res.json({ success: true, data: coupons.map(c => ({ ...c, discount_value: Number(c.discount_value), min_spend: Number(c.min_spend) })) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve coupons.' });
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, minSpend = 0 } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
    }

    await execute(`
      INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
      VALUES (?, ?, ?, ?, true)
    `, [code.trim().toUpperCase(), discountType || 'percentage', Number(discountValue), Number(minSpend)]);

    res.status(201).json({ success: true, message: 'Coupon created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create coupon. Code may already exist.' });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await execute('DELETE FROM coupons WHERE id = ?', [id]);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
};
