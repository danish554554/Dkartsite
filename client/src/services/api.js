let rawBase = (
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://dkartsite.onrender.com/api'
    : 'http://localhost:5000/api')
).trim().replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

export async function fetchApi(endpoint, options = {}, retries = 3) {
  const token = localStorage.getItem('dkart_token');
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const cacheBuster = `${endpoint.includes('?') ? '&' : '?'}_t=${Date.now()}`;
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}${cacheBuster}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        ...options,
        headers,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }
      return data;
    } catch (error) {
      if (attempt < retries && (!options.method || options.method === 'GET')) {
        console.log(`[Dkart API] Waiting for server cold start, retrying ${endpoint} (attempt ${attempt + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, 2500));
        continue;
      }
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }
}

function buildQueryString(params = {}) {
  const cleanParams = {};
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '' && val !== 'undefined') {
      cleanParams[key] = val;
    }
  });
  const qs = new URLSearchParams(cleanParams).toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  // Products
  getProducts: (params = {}) => fetchApi(`/products${buildQueryString(params)}`),
  getProductBySlug: (slug) => fetchApi(`/products/${slug}`),
  getCategories: () => fetchApi('/categories'),
  getBanners: () => fetchApi('/banners'),
  verifyCoupon: (code, subtotal) => fetchApi('/coupons/verify', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal })
  }),
  uploadReviewImages: (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    const token = localStorage.getItem('dkart_token');
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    return fetch(`${API_BASE_URL}/reviews/upload`, {
      method: 'POST',
      headers,
      body: formData
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Image upload failed.');
      return data;
    });
  },
  submitReview: (reviewData) => fetchApi('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),

  // Orders
  createOrder: (orderData) => fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  getOrderById: (id) => fetchApi(`/orders/${id}`),
  trackOrder: (orderId, phone) => fetchApi(`/orders/track${buildQueryString({ orderId, phone })}`),
  getUserOrders: () => fetchApi('/orders/user'),

  // Auth
  login: (email, password) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (userData) => fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  getMe: () => fetchApi('/auth/me'),
  updateProfile: (profileData) => fetchApi('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Admin
  getAdminAnalytics: () => fetchApi('/admin/analytics'),
  getAdminProducts: () => fetchApi('/admin/products'),
  createAdminProduct: (productData) => fetchApi('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  updateAdminProduct: (id, productData) => fetchApi(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  deleteAdminProduct: (id) => fetchApi(`/admin/products/${id}`, {
    method: 'DELETE'
  }),
  clearAllProducts: () => fetchApi('/admin/products/clear-all', {
    method: 'DELETE'
  }),
  getAdminOrders: (params = {}) => fetchApi(`/admin/orders${buildQueryString(params)}`),
  updateAdminOrderStatus: (id, statusData) => fetchApi(`/admin/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData)
  }),
  getAdminInventory: () => fetchApi('/admin/inventory'),
  updateAdminInventory: (id, stockQuantity) => fetchApi(`/admin/inventory/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ stockQuantity })
  }),
  getAdminCustomers: () => fetchApi('/admin/customers'),
  getAdminBanners: () => fetchApi('/admin/banners'),
  createAdminBanner: (bannerData) => fetchApi('/admin/banners', {
    method: 'POST',
    body: JSON.stringify(bannerData)
  }),
  deleteAdminBanner: (id) => fetchApi(`/admin/banners/${id}`, {
    method: 'DELETE'
  }),
  uploadImage: async (file) => {
    const token = localStorage.getItem('dkart_token');
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Image upload failed.');
    return data;
  },
  uploadMultipleImages: async (files) => {
    const token = localStorage.getItem('dkart_token');
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    const res = await fetch(`${API_BASE_URL}/admin/upload-multiple`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Multiple images upload failed.');
    return data;
  },
  // Admin Categories
  createAdminCategory: (categoryData) => fetchApi('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData)
  }),
  deleteAdminCategory: (id) => fetchApi(`/admin/categories/${id}`, {
    method: 'DELETE'
  }),
  // Admin Coupons
  getAdminCoupons: () => fetchApi('/admin/coupons'),
  createAdminCoupon: (couponData) => fetchApi('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(couponData)
  }),
  deleteAdminCoupon: (id) => fetchApi(`/admin/coupons/${id}`, {
    method: 'DELETE'
  })
};
