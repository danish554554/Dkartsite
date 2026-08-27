let rawBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').trim().replace(/\/+$/, '');
const API_BASE_URL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

export async function fetchApi(endpoint, options = {}) {
  const token = localStorage.getItem('dkart_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong. Please try again.');
    }
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/products?${query}`);
  },
  getProductBySlug: (slug) => fetchApi(`/products/${slug}`),
  getCategories: () => fetchApi('/categories'),
  getBanners: () => fetchApi('/banners'),
  verifyCoupon: (code, subtotal) => fetchApi('/coupons/verify', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal })
  }),
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
  trackOrder: (orderId, phone) => {
    const query = new URLSearchParams({ orderId, ...(phone ? { phone } : {}) }).toString();
    return fetchApi(`/orders/track?${query}`);
  },
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
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/admin/orders?${query}`);
  },
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
