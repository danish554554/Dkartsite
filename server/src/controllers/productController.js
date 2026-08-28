import { db } from '../database/db.js';

export const getProducts = (req, res) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      inStock,
      badge,
      featured,
      trending,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    let query = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (q) {
      query += ` AND (p.title LIKE ? OR p.tagline LIKE ? OR p.description LIKE ?)`;
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    if (category) {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    if (minPrice) {
      query += ` AND COALESCE(p.sale_price, p.price) >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND COALESCE(p.sale_price, p.price) <= ?`;
      params.push(Number(maxPrice));
    }

    if (inStock === 'true' || inStock === '1') {
      query += ` AND p.is_in_stock = 1 AND p.stock_quantity > 0`;
    }

    if (badge) {
      query += ` AND p.badge = ?`;
      params.push(badge);
    }

    if (featured === 'true' || featured === '1') {
      query += ` AND p.is_featured = 1`;
    }

    if (trending === 'true' || trending === '1') {
      query += ` AND p.is_trending = 1`;
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        query += ` ORDER BY COALESCE(p.sale_price, p.price) ASC`;
        break;
      case 'price-desc':
        query += ` ORDER BY COALESCE(p.sale_price, p.price) DESC`;
        break;
      case 'rating':
        query += ` ORDER BY p.rating_average DESC, p.rating_count DESC`;
        break;
      case 'popular':
        query += ` ORDER BY p.rating_count DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY p.id DESC`;
        break;
    }

    // Pagination
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM (${query})`;
    const totalCount = db.prepare(countQuery).get(...params).count;

    query += ` LIMIT ? OFFSET ?`;
    params.push(parsedLimit, offset);

    const products = db.prepare(query).all(...params);

    const formatted = products.map(p => ({
      ...p,
      key_features: p.key_features ? JSON.parse(p.key_features) : [],
      specs: p.specs ? JSON.parse(p.specs) : {},
      is_in_stock: Boolean(p.is_in_stock),
      is_featured: Boolean(p.is_featured),
      is_trending: Boolean(p.is_trending)
    }));

    res.json({
      success: true,
      data: formatted,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / parsedLimit)
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

export const getProductBySlug = (req, res) => {
  try {
    const { slug } = req.params;

    const product = db.prepare(`
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ? OR p.slug LIKE ? OR p.id = ?
    `).get(slug, `${slug}%`, isNaN(Number(slug)) ? -1 : Number(slug));

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch images
    const images = db.prepare(`
      SELECT id, url, alt_text, is_primary 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, display_order ASC
    `).all(product.id);

    // Fetch variants
    const variants = db.prepare(`
      SELECT id, variant_type, variant_name, price_modifier, stock_quantity, image_url 
      FROM product_variants 
      WHERE product_id = ?
    `).all(product.id);

    // Fetch reviews
    const reviews = db.prepare(`
      SELECT id, user_name, rating, comment, city, verified_purchase, created_at 
      FROM reviews 
      WHERE product_id = ? 
      ORDER BY id DESC
    `).all(product.id);

    // Fetch related products (up to 4 from same category)
    const relatedProducts = db.prepare(`
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      LIMIT 4
    `).all(product.category_id, product.id);

    const fullProduct = {
      ...product,
      key_features: product.key_features ? JSON.parse(product.key_features) : [],
      specs: product.specs ? JSON.parse(product.specs) : {},
      is_in_stock: Boolean(product.is_in_stock),
      is_featured: Boolean(product.is_featured),
      is_trending: Boolean(product.is_trending),
      images: images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', is_primary: 1 }],
      variants,
      reviews,
      relatedProducts
    };

    res.json({ success: true, data: fullProduct });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

export const getCategories = (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `).all();

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

export const getBanners = (req, res) => {
  try {
    const banners = db.prepare(`
      SELECT * FROM banners 
      WHERE is_active = 1 
      ORDER BY display_order ASC, id ASC
    `).all();

    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve banners.' });
  }
};

export const verifyCoupon = (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = 1').get(code.trim());
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const sub = Number(subtotal) || 0;
    if (sub < coupon.min_spend) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of Rs. ${coupon.min_spend.toLocaleString()}.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((sub * coupon.discount_value) / 100);
    } else {
      discount = Math.min(coupon.discount_value, sub);
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        calculatedDiscount: discount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify coupon.' });
  }
};

export const submitReview = (req, res) => {
  try {
    const { productId, userName, rating, comment, city } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All review fields are required.' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10)));

    db.prepare(`
      INSERT INTO reviews (product_id, user_name, rating, comment, city, verified_purchase)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(productId, userName.trim(), numericRating, comment.trim(), city ? city.trim() : 'Karachi');

    // Recalculate average rating
    const stats = db.prepare(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count 
      FROM reviews 
      WHERE product_id = ?
    `).get(productId);

    db.prepare(`
      UPDATE products 
      SET rating_average = ?, rating_count = ? 
      WHERE id = ?
    `).run(Number(stats.avg_rating.toFixed(1)), stats.count, productId);

    res.status(201).json({ success: true, message: 'Review submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};
