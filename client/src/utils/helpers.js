// Pakistani Rupee Formatter
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
}

export function calculateDiscount(price, salePrice) {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

// Pakistani Provinces & Major Cities for quick auto-fill in checkout
export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan'
];

export const POPULAR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Sheikhupura',
  'Jhelum',
  'Gujrat',
  'Mardan',
  'Mirpur'
];

// Marketing & Analytics Event Tracking (Meta Pixel & GA4 readiness)
export function trackEvent(eventName, params = {}) {
  // Console logging for debugging in development
  if (import.meta.env.DEV) {
    console.log(`📊 [Analytics Event] ${eventName}:`, params);
  }

  // Meta Pixel (Facebook Pixel)
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    try {
      window.fbq('track', eventName, params);
    } catch (e) {
      console.warn('Meta Pixel tracking error:', e);
    }
  }

  // Google Analytics 4 (gtag)
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (e) {
      console.warn('GA4 tracking error:', e);
    }
  }
}
