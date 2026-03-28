import api from "./axios";

// ── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register/", data),
  login: (data) => api.post("/auth/login/", data),
  logout: (data) => api.post("/auth/logout/", data),
  refreshToken: (data) => api.post("/auth/token/refresh/", data),
  getProfile: () => api.get("/auth/profile/"),
  updateProfile: (data) => api.patch("/auth/profile/", data),
  changePassword: (data) => api.post("/auth/change-password/", data),
};

// ── Categories ────────────────────────────────────────────────
export const categoriesAPI = {
  getAll: () => api.get("/categories/"),
};

// ── Products ──────────────────────────────────────────────────
export const productsAPI = {
  getAll: (params) => api.get("/products/", { params }),
  getBySlug: (slug) => api.get(`/products/${slug}/`),
};

// ── Cart ──────────────────────────────────────────────────────
export const cartAPI = {
  getCart: (params = {}) => api.get("/cart/", { params }),
  addItem: (data) => api.post("/cart/add/", data),
  updateItem: (itemId, data) =>
    api.patch(`/cart/items/${itemId}/`, data, {
      params: { cart_id: cartStore.cart?.id },
    }),
  removeItem: (itemId, cartId) =>
    api.delete(`/cart/items/${itemId}/`, {
      params: { cart_id: cartId },
    }),
  clearCart: (cartId) =>
    api.delete("/cart/clear/", {
      params: { cart_id: cartId },
    }),
};

// ── Checkout & Orders ─────────────────────────────────────────
export const ordersAPI = {
  checkout: (data) => api.post("/checkout/", data),
  getMyOrders: (params) => api.get("/orders/", { params }),
  getOrder: (orderNumber) => api.get(`/orders/${orderNumber}/`),
  cancelOrder: (orderNumber, data) =>
    api.post(`/orders/${orderNumber}/cancel/`, data),
};

// ── Reviews ───────────────────────────────────────────────────
export const reviewsAPI = {
  getReviews: (slug) => api.get(`/products/${slug}/reviews/`),
  addReview: (slug, data) => api.post(`/products/${slug}/reviews/add/`, data),
  deleteReview: (slug, id) =>
    api.delete(`/products/${slug}/reviews/${id}/delete/`),
};

// ── Coupon ────────────────────────────────────────────────────
export const couponsAPI = {
  validate: (data) => api.post("/coupons/validate/", data),
};
