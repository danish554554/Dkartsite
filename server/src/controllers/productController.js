import { query, queryOne, queryAll, execute } from '../database/db.js';

export const getProducts = async (req, res) => {
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

    let sql = `
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC, display_order ASC LIMIT 1) as primary_image,
        (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as actual_review_count
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (q) {
      sql += ` AND (p.title ILIKE ? OR p.tagline ILIKE ? OR p.description ILIKE ?)`;
      const term = `%${q.trim()}%`;
      params.push(term, term, term);
    }

    if (category) {
      sql += ` AND c.slug = ?`;
      params.push(category);
    }

    if (minPrice) {
      sql += ` AND COALESCE(p.sale_price, p.price) >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ` AND COALESCE(p.sale_price, p.price) <= ?`;
      params.push(Number(maxPrice));
    }

    if (inStock === 'true' || inStock === '1') {
      sql += ` AND p.is_in_stock = true AND p.stock_quantity > 0`;
    }

    if (badge) {
      sql += ` AND p.badge = ?`;
      params.push(badge);
    }

    if (featured === 'true' || featured === '1') {
      sql += ` AND p.is_featured = true`;
    }

    if (trending === 'true' || trending === '1') {
      sql += ` AND p.is_trending = true`;
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        sql += ` ORDER BY COALESCE(p.sale_price, p.price) ASC`;
        break;
      case 'price-desc':
        sql += ` ORDER BY COALESCE(p.sale_price, p.price) DESC`;
        break;
      case 'rating':
        sql += ` ORDER BY p.rating_average DESC, p.rating_count DESC`;
        break;
      case 'popular':
        sql += ` ORDER BY p.rating_count DESC`;
        break;
      case 'newest':
      default:
        sql += ` ORDER BY p.id DESC`;
        break;
    }

    // Pagination
    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const offset = (parsedPage - 1) * parsedLimit;

    // Count query
    const countSql = `SELECT COUNT(*) as count FROM (${sql}) as subquery`;
    const countRow = await queryOne(countSql, params);
    const totalCount = parseInt(countRow?.count || 0, 10);

    sql += ` LIMIT ? OFFSET ?`;
    const pageParams = [...params, parsedLimit, offset];

    const products = await queryAll(sql, pageParams);

    const formatted = products.map(p => ({
      ...p,
      price: Number(p.price),
      sale_price: p.sale_price !== null ? Number(p.sale_price) : null,
      rating_average: Number(p.rating_average || 5),
      rating_count: p.actual_review_count !== undefined && p.actual_review_count !== null ? Number(p.actual_review_count) : Number(p.rating_count),
      key_features: Array.isArray(p.key_features) ? p.key_features : (typeof p.key_features === 'string' ? JSON.parse(p.key_features) : []),
      specs: typeof p.specs === 'object' && p.specs !== null ? p.specs : (typeof p.specs === 'string' ? JSON.parse(p.specs) : {}),
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
        totalPages: Math.ceil(totalCount / parsedLimit) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
  }
};

export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const isNumeric = !isNaN(Number(slug)) && Number.isInteger(Number(slug));
    let product;

    if (isNumeric) {
      product = await queryOne(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
      `, [Number(slug)]);
    } else {
      product = await queryOne(`
        SELECT p.*, c.name as category_name, c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ? OR p.slug ILIKE ?
      `, [slug, `${slug}%`]);
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Fetch images
    const images = await queryAll(`
      SELECT id, url, alt_text, is_primary 
      FROM product_images 
      WHERE product_id = ? 
      ORDER BY is_primary DESC, display_order ASC
    `, [product.id]);

    // Fetch variants
    const variants = await queryAll(`
      SELECT id, variant_type, variant_name, price_modifier, stock_quantity, image_url 
      FROM product_variants 
      WHERE product_id = ?
    `, [product.id]);

    // Fetch reviews
    const rawReviews = await queryAll(`
      SELECT id, user_name, rating, comment, city, images, verified_purchase, created_at 
      FROM reviews 
      WHERE product_id = ? 
      ORDER BY id DESC
    `, [product.id]);

    const reviews = rawReviews.map((r) => {
      let imgList = [];
      if (Array.isArray(r.images)) {
        imgList = r.images;
      } else if (typeof r.images === 'string') {
        try {
          imgList = JSON.parse(r.images);
        } catch {
          imgList = [];
        }
      }
      return {
        ...r,
        images: imgList
      };
    });

    // Related products
    const relatedProducts = await queryAll(`
      SELECT 
        p.*, 
        c.name as category_name, 
        c.slug as category_slug,
        (SELECT url FROM product_images WHERE product_id = p.id ORDER BY is_primary DESC LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ? AND p.id != ?
      LIMIT 4
    `, [product.category_id, product.id]);

    const fullProduct = {
      ...product,
      price: Number(product.price),
      sale_price: product.sale_price !== null ? Number(product.sale_price) : null,
      rating_average: Number(product.rating_average || 5),
      key_features: Array.isArray(product.key_features) ? product.key_features : (typeof product.key_features === 'string' ? JSON.parse(product.key_features) : []),
      specs: typeof product.specs === 'object' && product.specs !== null ? product.specs : (typeof product.specs === 'string' ? JSON.parse(product.specs) : {}),
      is_in_stock: Boolean(product.is_in_stock),
      is_featured: Boolean(product.is_featured),
      is_trending: Boolean(product.is_trending),
      images: images.length > 0 ? images : [{ url: '/uploads/nova-2-in-1-hair-straightener-curler-main.webp', is_primary: true }],
      variants: variants.map(v => ({ ...v, price_modifier: Number(v.price_modifier || 0) })),
      reviews,
      relatedProducts: relatedProducts.map(p => ({
        ...p,
        price: Number(p.price),
        sale_price: p.sale_price !== null ? Number(p.sale_price) : null
      }))
    };

    res.json({ success: true, data: fullProduct });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve product details.' });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await queryAll(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `);

    res.json({ success: true, data: categories.map(c => ({ ...c, product_count: Number(c.product_count || 0) })) });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await queryAll(`
      SELECT * FROM banners 
      WHERE is_active = true 
      ORDER BY id ASC
    `);

    res.json({ success: true, data: banners });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve banners.' });
  }
};

export const verifyCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const coupon = await queryOne('SELECT * FROM coupons WHERE UPPER(code) = UPPER(?) AND is_active = true', [code.trim()]);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
    }

    const sub = Number(subtotal) || 0;
    const minSpend = Number(coupon.min_spend || 0);

    if (sub < minSpend) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of Rs. ${minSpend.toLocaleString()}.`
      });
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = Math.round((sub * Number(coupon.discount_value)) / 100);
    } else {
      discount = Math.min(Number(coupon.discount_value), sub);
    }

    res.json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: Number(coupon.discount_value),
        calculatedDiscount: discount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify coupon.' });
  }
};

export const submitReview = async (req, res) => {
  try {
    const { productId, userName, rating, comment, city, images = [] } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'All review fields are required.' });
    }

    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10)));
    const imagesJson = JSON.stringify(Array.isArray(images) ? images : []);

    await execute(`
      INSERT INTO reviews (product_id, user_name, rating, comment, city, images, verified_purchase)
      VALUES (?, ?, ?, ?, ?, ?, true)
    `, [productId, userName.trim(), numericRating, comment.trim(), city ? city.trim() : 'Karachi', imagesJson]);

    // Recalculate average rating
    const stats = await queryOne(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as count 
      FROM reviews 
      WHERE product_id = ?
    `, [productId]);

    const avg = Number(stats?.avg_rating || 5);
    const count = Number(stats?.count || 1);

    await execute(`
      UPDATE products 
      SET rating_average = ?, rating_count = ? 
      WHERE id = ?
    `, [Number(avg.toFixed(1)), count, productId]);

    res.status(201).json({ success: true, message: 'Review submitted successfully.' });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};
