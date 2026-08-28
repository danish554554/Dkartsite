import { db } from '../database/db.js';

export const getAnalytics = (req, res) => {
  try {
    const totalSalesRow = db.prepare("SELECT SUM(total_amount) as total FROM orders WHERE order_status != 'Cancelled'").get();
    const totalSales = totalSalesRow?.total || 0;

    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const pendingOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Pending' OR order_status = 'Processing'").get().count;
    const deliveredOrders = db.prepare("SELECT COUNT(*) as count FROM orders WHERE order_status = 'Delivered'").get().count;

    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const lowStockProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 10').get().count;
    const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get().count;

    const recentOrders = db.prepare(`
      SELECT id, customer_name, customer_phone, total_amount, order_status, payment_method, created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 6
    `).all();

    const topProducts = db.prepare(`
      SELECT p.id, p.title, p.price, p.sale_price, p.stock_quantity,
        (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image,
        SUM(oi.quantity) as units_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id
      ORDER BY units_sold DESC
      LIMIT 5
    `).all();

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
        recentOrders,
        topProducts
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics.' });
  }
};

export const getAllProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT 
        p.*, 
        c.name as category_name,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `).all();

    const fullProducts = products.map((p) => {
      const images = db.prepare('SELECT id, url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC, display_order ASC').all(p.id);
      const variants = db.prepare('SELECT id, variant_type, variant_name, price_modifier, stock_quantity FROM product_variants WHERE product_id = ?').all(p.id);
      return {
        ...p,
        key_features: p.key_features ? JSON.parse(p.key_features) : [],
        specs: p.specs ? JSON.parse(p.specs) : {},
        images,
        variants
      };
    });

    res.json({ success: true, data: fullProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

export const createProduct = (req, res) => {
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

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const regularPrice = parseFloat(price);
    const sPrice = salePrice ? parseFloat(salePrice) : null;
    const discount = sPrice && sPrice < regularPrice ? Math.round(((regularPrice - sPrice) / regularPrice) * 100) : 0;
    const stock = parseInt(stockQuantity, 10) || 25;

    const result = db.prepare(`
      INSERT INTO products (
        title, slug, tagline, description, key_features, specs, category_id,
        badge, price, sale_price, discount_percentage, stock_quantity, is_in_stock,
        sku, is_featured, is_trending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
      stock > 0 ? 1 : 0,
      sku || `DK-${Math.floor(1000 + Math.random() * 9000)}`,
      1,
      0
    );

    const productId = result.lastInsertRowid;

    // Save Images
    if (Array.isArray(images) && images.length > 0) {
      const insertImg = db.prepare('INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES (?, ?, ?, ?, ?)');
      images.forEach((img, i) => {
        const url = typeof img === 'string' ? img : img.url;
        const isPrimary = typeof img === 'object' && img.is_primary !== undefined ? (img.is_primary ? 1 : 0) : (i === 0 ? 1 : 0);
        insertImg.run(productId, url, title, isPrimary, i);
      });
    }

    // Save Variants
    if (Array.isArray(variants) && variants.length > 0) {
      const insertVar = db.prepare('INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity) VALUES (?, ?, ?, ?, ?)');
      variants.forEach((v) => {
        insertVar.run(
          productId,
          v.variant_type || 'color',
          v.variant_name,
          Number(v.price_modifier || 0),
          Number(v.stock_quantity || 20)
        );
      });
    }

    res.status(201).json({ success: true, message: 'Product created successfully with all images and variants!', id: productId, slug });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
};

export const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
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
      isFeatured,
      isTrending,
      images,
      variants,
      keyFeatures,
      specs
    } = req.body;

    const regularPrice = parseFloat(price);
    const sPrice = salePrice !== undefined && salePrice !== '' ? parseFloat(salePrice) : null;
    const discount = sPrice && sPrice < regularPrice ? Math.round(((regularPrice - sPrice) / regularPrice) * 100) : 0;
    const stock = parseInt(stockQuantity, 10) || 0;

    db.prepare(`
      UPDATE products
      SET 
        title = COALESCE(?, title),
        tagline = COALESCE(?, tagline),
        description = COALESCE(?, description),
        category_id = ?,
        price = ?,
        sale_price = ?,
        discount_percentage = ?,
        stock_quantity = ?,
        is_in_stock = ?,
        badge = ?,
        sku = COALESCE(?, sku),
        key_features = COALESCE(?, key_features),
        specs = COALESCE(?, specs),
        is_featured = COALESCE(?, is_featured),
        is_trending = COALESCE(?, is_trending)
      WHERE id = ?
    `).run(
      title, tagline, description,
      categoryId || null,
      regularPrice, sPrice, discount, stock, stock > 0 ? 1 : 0,
      badge || null, sku,
      keyFeatures ? JSON.stringify(keyFeatures) : null,
      specs ? JSON.stringify(specs) : null,
      isFeatured !== undefined ? (isFeatured ? 1 : 0) : null,
      isTrending !== undefined ? (isTrending ? 1 : 0) : null,
      id
    );

    // Update images if provided
    if (Array.isArray(images)) {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
      const insertImg = db.prepare('INSERT INTO product_images (product_id, url, alt_text, is_primary, display_order) VALUES (?, ?, ?, ?, ?)');
      images.forEach((img, i) => {
        const url = typeof img === 'string' ? img : img.url;
        const isPrimary = typeof img === 'object' && img.is_primary !== undefined ? (img.is_primary ? 1 : 0) : (i === 0 ? 1 : 0);
        insertImg.run(id, url, title || 'Product Image', isPrimary, i);
      });
    }

    // Update variants if provided
    if (Array.isArray(variants)) {
      db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
      const insertVar = db.prepare('INSERT INTO product_variants (product_id, variant_type, variant_name, price_modifier, stock_quantity) VALUES (?, ?, ?, ?, ?)');
      variants.forEach((v) => {
        insertVar.run(
          id,
          v.variant_type || 'color',
          v.variant_name,
          Number(v.price_modifier || 0),
          Number(v.stock_quantity || 20)
        );
      });
    }

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

export const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    db.pragma('foreign_keys = OFF');
    db.prepare('DELETE FROM order_items WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM product_images WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM product_variants WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM reviews WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM wishlist WHERE product_id = ?').run(id);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    db.pragma('foreign_keys = ON');
    res.json({ success: true, message: 'Product deleted.' });
  } catch (error) {
    db.pragma('foreign_keys = ON');
    console.error('deleteProduct error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

export const clearAllProducts = (req, res) => {
  try {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM wishlist;
      DELETE FROM reviews;
      DELETE FROM product_variants;
      DELETE FROM product_images;
      DELETE FROM products;
    `);
    db.pragma('foreign_keys = ON');
    res.json({ success: true, message: 'All products cleared successfully.' });
  } catch (error) {
    db.pragma('foreign_keys = ON');
    console.error('Clear products error:', error);
    res.status(500).json({ success: false, message: 'Failed to clear products.' });
  }
};

export const getAllOrders = (req, res) => {
  try {
    const { status, search } = req.query;
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];

    if (status && status !== 'All' && status !== 'undefined') {
      query += ' AND order_status = ?';
      params.push(status);
    }

    if (search && search !== 'undefined' && search.trim() !== '') {
      query += ' AND (id LIKE ? OR customer_name LIKE ? OR customer_phone LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const orders = db.prepare(query).all(...params);
    const fullOrders = orders.map((o) => {
      let parsedAddress = o.shipping_address;
      if (typeof o.shipping_address === 'string') {
        try {
          parsedAddress = JSON.parse(o.shipping_address);
        } catch {
          parsedAddress = { address: o.shipping_address };
        }
      }
      return {
        ...o,
        shipping_address: parsedAddress,
        items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
      };
    });

    res.json({ success: true, data: fullOrders });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve orders.' });
  }
};

export const updateOrderStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    db.prepare(`
      UPDATE orders
      SET order_status = ?, tracking_number = COALESCE(?, tracking_number)
      WHERE id = ?
    `).run(status, trackingNumber || null, id);

    res.json({ success: true, message: `Order status updated to "${status}".` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
};

export const getInventory = (req, res) => {
  try {
    const items = db.prepare(`
      SELECT 
        p.id, p.title, p.sku, p.stock_quantity, p.price, p.sale_price,
        c.name as category_name,
        (SELECT url FROM product_images WHERE product_id = p.id LIMIT 1) as image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.stock_quantity ASC
    `).all();

    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve inventory.' });
  }
};

export const updateInventory = (req, res) => {
  try {
    const { id } = req.params;
    const { stockQuantity } = req.body;
    const qty = parseInt(stockQuantity, 10);

    db.prepare(`
      UPDATE products
      SET stock_quantity = ?, is_in_stock = ?
      WHERE id = ?
    `).run(qty, qty > 0 ? 1 : 0, id);

    res.json({ success: true, message: 'Stock updated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update inventory.' });
  }
};

export const getCustomers = (req, res) => {
  try {
    const customers = db.prepare(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.created_at,
        COUNT(o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve customers.' });
  }
};

export const getAdminBanners = (req, res) => {
  try {
    const banners = db.prepare('SELECT * FROM banners ORDER BY position, display_order').all();
    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve banners.' });
  }
};

export const createBanner = (req, res) => {
  try {
    const { title, subtitle, badge, ctaText, ctaLink, imageUrl, position = 'hero' } = req.body;
    db.prepare(`
      INSERT INTO banners (title, subtitle, badge, cta_text, cta_link, image_url, position, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(title, subtitle, badge, ctaText || 'Shop Now', ctaLink || '/shop', imageUrl, position);

    res.status(201).json({ success: true, message: 'Banner created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create banner.' });
  }
};

export const deleteBanner = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM banners WHERE id = ?').run(id);
    res.json({ success: true, message: 'Banner deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete banner.' });
  }
};

// Category Management
export const createCategory = (req, res) => {
  try {
    const { name, description, imageUrl, isFeatured = 1 } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Category name is required.' });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const result = db.prepare(`
      INSERT INTO categories (name, slug, description, image_url, is_featured)
      VALUES (?, ?, ?, ?, ?)
    `).run(name.trim(), slug, description || '', imageUrl || '', isFeatured ? 1 : 0);

    res.status(201).json({ success: true, message: 'Category created.', id: result.lastInsertRowid });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create category.' });
  }
};

export const deleteCategory = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};

// Coupon Management
export const getAdminCoupons = (req, res) => {
  try {
    const coupons = db.prepare('SELECT * FROM coupons ORDER BY id DESC').all();
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve coupons.' });
  }
};

export const createCoupon = (req, res) => {
  try {
    const { code, discountType, discountValue, minSpend = 0 } = req.body;
    if (!code || !discountValue) {
      return res.status(400).json({ success: false, message: 'Code and discount value are required.' });
    }

    db.prepare(`
      INSERT INTO coupons (code, discount_type, discount_value, min_spend, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run(code.trim().toUpperCase(), discountType || 'percentage', Number(discountValue), Number(minSpend));

    res.status(201).json({ success: true, message: 'Coupon created successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create coupon. Code may already exist.' });
  }
};

export const deleteCoupon = (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM coupons WHERE id = ?').run(id);
    res.json({ success: true, message: 'Coupon deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
  }
};
