import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1/abecp';

/**
 * Unified API client — works in both browser (cookies) and SSR (forwarded headers).
 * Token is stored in localStorage; automatically attached as Bearer header.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json', 'Accept-Language': 'ar' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('abv_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    const guestToken = localStorage.getItem('abv_guest_token');
    if (guestToken) config.headers['X-Guest-Token'] = guestToken;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('abv_refresh_token');
      if (refreshToken && !error.config?.url?.includes('auth/admin/')) {
        try {
          const r = await axios.post(`${API_BASE}/auth/admin/refresh`, { refreshToken });
          localStorage.setItem('abv_admin_token', r.data.data.accessToken);
          error.config!.headers!.Authorization = `Bearer ${r.data.data.accessToken}`;
          return axios.request(error.config!);
        } catch {
          localStorage.removeItem('abv_admin_token');
          localStorage.removeItem('abv_refresh_token');
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

// ===== Typed API shortcuts =====
export const ProductsAPI = {
  list: (params?: any) => api.get('/products', { params }).then((r) => r.data),
  get: (slug: string) => api.get(`/products/${slug}`).then((r) => r.data),
  featured: () => api.get('/products/featured').then((r) => r.data),
  flashSale: () => api.get('/products/flash-sale').then((r) => r.data),
  recommendations: (id: string) => api.get(`/products/${id}/recommendations`).then((r) => r.data),
  visualSearch: (file: File) => {
    const fd = new FormData(); fd.append('image', file);
    return api.post('/products/visual-search', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
};

export const CartAPI = {
  get: () => api.get('/cart').then((r) => r.data),
  addItem: (item: any) => api.post('/cart/items', item).then((r) => r.data),
  updateQty: (itemId: string, quantity: number) => api.patch(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`).then((r) => r.data),
};

export const OrdersAPI = {
  checkout: (data: any) => api.post('/orders/checkout', data).then((r) => r.data),
  track: (phone: string, code: string) => api.get('/orders/track', { params: { phone, code } }).then((r) => r.data),
};

export const AuthAPI = {
  login: (email: string, password: string, device?: string) =>
    api.post('/auth/admin/login', { email, password, device }).then((r) => r.data),
  refresh: (refreshToken: string) =>
    api.post('/auth/admin/refresh', { refreshToken }).then((r) => r.data),
  logout: () => api.post('/auth/admin/logout').then((r) => r.data),
  me: () => api.get('/auth/admin/me').then((r) => r.data),
};

export const AiAPI = {
  assistant: (message: string, sessionId?: string, context?: any) =>
    api.post('/ai/assistant', { message, sessionId, context }).then((r) => r.data),
  sizeCalculator: (input: { heightCm: number; weightKg: number; footCm?: number; category: string }) =>
    api.post('/ai/size-calculator', input).then((r) => r.data),
  adCopy: (productId: string) => api.post('/ai/ad-copy', { productId }).then((r) => r.data),
};

export const SettingsAPI = {
  public: () => api.get('/settings/public').then((r) => r.data),
  currency: () => api.get('/currency/rates').then((r) => r.data),
  banners: () => api.get('/banners').then((r) => r.data),
};

export const LoyaltyAPI = {
  me: () => api.get('/loyalty/me').then((r) => r.data),
  history: (page = 1) => api.get('/loyalty/me/transactions', { params: { page } }).then((r) => r.data),
  redeem: (points: number) => api.post('/loyalty/redeem', { points }).then((r) => r.data),
};

export const GiftCardsAPI = {
  create: (data: any) => api.post('/gift-cards', data).then((r) => r.data),
  balance: (code: string) => api.get(`/gift-cards/${code}/balance`).then((r) => r.data),
};

export const GroupBuyingAPI = {
  create: (hostName: string, hostPhone: string) => api.post('/group-buying/rooms', { hostName, hostPhone }).then((r) => r.data),
  get: (code: string) => api.get(`/group-buying/rooms/${code}`).then((r) => r.data),
  join: (code: string, name: string, amount: number) =>
    api.post(`/group-buying/rooms/${code}/members`, { name, amount }).then((r) => r.data),
};

export const AdminAPI = {
  dashboard: () => api.get('/admin/dashboard/summary').then((r) => r.data),
  products: (params?: any) => api.get('/products/admin/all', { params }).then((r) => r.data),
  createProduct: (data: any) => api.post('/products/admin/create', data).then((r) => r.data),
  updateProduct: (id: string, data: any) => api.patch(`/products/admin/${id}`, data).then((r) => r.data),
  deleteProduct: (id: string) => api.delete(`/products/admin/${id}`).then((r) => r.data),
  bulkImport: (file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/products/admin/bulk-import', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
  },
  orders: (params?: any) => api.get('/admin/orders', { params }).then((r) => r.data),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    api.patch(`/admin/orders/${id}/status`, { status, note }).then((r) => r.data),
  archiveOrder: (id: string) => api.post(`/admin/orders/${id}/archive`).then((r) => r.data),
  vouchers: (params?: any) => api.get('/admin/vouchers', { params }).then((r) => r.data),
  createVoucher: (data: any) => api.post('/admin/vouchers', data).then((r) => r.data),
  deleteVoucher: (id: string) => api.delete(`/admin/vouchers/${id}`).then((r) => r.data),
  affiliates: () => api.get('/admin/affiliates').then((r) => r.data),
  createAffiliate: (data: any) => api.post('/admin/affiliates', data).then((r) => r.data),
  inventoryInsights: () => api.get('/ai/analytics/inventory').then((r) => r.data),
  searchSummary: (days = 7) => api.get('/ai/analytics/searches', { params: { days } }).then((r) => r.data),
  auditLogs: (params?: any) => api.get('/admin/audit-logs', { params }).then((r) => r.data),
  settings: () => api.get('/admin/settings').then((r) => r.data),
  updateSettings: (patch: any) => api.patch('/admin/settings', patch).then((r) => r.data),
  promotions: () => api.get('/admin/promotions').then((r) => r.data),
  createPromotion: (data: any) => api.post('/admin/promotions', data).then((r) => r.data),
};