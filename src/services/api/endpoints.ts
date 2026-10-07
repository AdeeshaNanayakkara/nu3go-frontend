/**
 * API endpoint constants.
 * Centralized definition of all backend API endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const API_ENDPOINTS = {
  // ─── Auth ───
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    REGISTER: `${API_BASE}/auth/register`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/auth/me`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
  },

  // ─── Users ───
  USERS: {
    LIST: `${API_BASE}/users`,
    DETAIL: (id: string) => `${API_BASE}/users/${id}`,
    PROFILE: `${API_BASE}/users/profile`,
    UPDATE_PROFILE: `${API_BASE}/users/profile`,
  },

  // ─── Services ───
  SERVICES: {
    LIST: `${API_BASE}/services`,
    DETAIL: (slug: string) => `${API_BASE}/services/${slug}`,
    CREATE: `${API_BASE}/services`,
    UPDATE: (id: string) => `${API_BASE}/services/${id}`,
    DELETE: (id: string) => `${API_BASE}/services/${id}`,
    SEARCH: `${API_BASE}/services/search`,
  },

  // ─── Categories ───
  CATEGORIES: {
    LIST: `${API_BASE}/categories`,
    DETAIL: (slug: string) => `${API_BASE}/categories/${slug}`,
  },

  // ─── Blog ───
  BLOG: {
    LIST: `${API_BASE}/blog`,
    DETAIL: (slug: string) => `${API_BASE}/blog/${slug}`,
  },

  // ─── Orders ───
  ORDERS: {
    LIST: `${API_BASE}/orders`,
    DETAIL: (id: string) => `${API_BASE}/orders/${id}`,
    CREATE: `${API_BASE}/orders`,
    UPDATE_STATUS: (id: string) => `${API_BASE}/orders/${id}/status`,
  },

  // ─── Payments ───
  PAYMENTS: {
    LIST: `${API_BASE}/payments`,
    DETAIL: (id: string) => `${API_BASE}/payments/${id}`,
    CREATE: `${API_BASE}/payments`,
  },

  // ─── Notifications ───
  NOTIFICATIONS: {
    LIST: `${API_BASE}/notifications`,
    MARK_READ: (id: string) => `${API_BASE}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE}/notifications/read-all`,
  },

  // ─── Admin ───
  ADMIN: {
    DASHBOARD_STATS: `${API_BASE}/admin/dashboard`,
    USERS: `${API_BASE}/admin/users`,
    USER_DETAIL: (id: string) => `${API_BASE}/admin/users/${id}`,
    SERVICES: `${API_BASE}/admin/services`,
    ORDERS: `${API_BASE}/admin/orders`,
  },
} as const;
