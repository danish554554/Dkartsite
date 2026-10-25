/**
 * Meta (Facebook) Pixel & Commerce Tracking Utility
 * Supports official Meta Commerce Manager events for Catalog & Ad targeting.
 */

const DEFAULT_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '2315336899320747';

export const initMetaPixel = (customPixelId = null) => {
  const pixelId = customPixelId || DEFAULT_PIXEL_ID;
  if (!pixelId || typeof window === 'undefined') return;

  if (window.fbq) return; // already initialized

  /* eslint-disable */
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
  console.log(`[Meta Commerce] Pixel initialized (${pixelId})`);
};

export const trackMetaEvent = (eventName, data = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
    console.log(`[Meta Event] ${eventName}`, data);
  }
};

/**
 * Track Product View for Meta Commerce Catalog Matching
 */
export const trackProductView = (product) => {
  if (!product) return;
  const sku = product.sku || `DKART-${product.id}`;
  const price = Number(product.sale_price || product.price || 0);

  trackMetaEvent('ViewContent', {
    content_name: product.title,
    content_category: product.category_name || 'General',
    content_ids: [sku],
    content_type: 'product',
    value: price,
    currency: 'PKR'
  });
};

/**
 * Track Add To Cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  const sku = product.sku || `DKART-${product.id}`;
  const price = Number(product.sale_price || product.price || 0);

  trackMetaEvent('AddToCart', {
    content_name: product.title,
    content_category: product.category_name || 'General',
    content_ids: [sku],
    content_type: 'product',
    value: price * quantity,
    currency: 'PKR'
  });
};

/**
 * Track Initiate Checkout
 */
export const trackInitiateCheckout = (items = [], totalValue = 0) => {
  const contentIds = items.map(item => item.sku || `DKART-${item.id}`);

  trackMetaEvent('InitiateCheckout', {
    content_ids: contentIds,
    content_type: 'product',
    num_items: items.reduce((acc, it) => acc + (it.quantity || 1), 0),
    value: Number(totalValue || 0),
    currency: 'PKR'
  });
};

/**
 * Track Purchase / Order Placed
 */
export const trackPurchase = (order) => {
  if (!order) return;
  const items = order.items || [];
  const contentIds = items.map(it => it.sku || `DKART-${it.product_id || it.id}`);

  trackMetaEvent('Purchase', {
    content_ids: contentIds,
    content_type: 'product',
    value: Number(order.total_amount || 0),
    currency: 'PKR',
    num_items: items.reduce((acc, it) => acc + (it.quantity || 1), 0)
  });
};
