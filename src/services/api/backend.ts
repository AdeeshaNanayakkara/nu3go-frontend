/**
 * Backend API base URL and endpoints.
 * All backend routes (including auth) live under the /api/v1 base path.
 */
export const BACKEND_BASE = (
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://13.201.222.82:80"
).replace(/\/+$/, "");

export const API_V1 = `${BACKEND_BASE}/api/v1`;
export const SWAGGER_DOC_URL = `${BACKEND_BASE}/swagger/index.html#/`;

export const BACKEND_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_V1}/auth/login`,
    REGISTER: `${API_V1}/auth/register`,
    LOGOUT: `${API_V1}/auth/logout`,
    REFRESH: `${API_V1}/auth/refresh`,
    VERIFY: `${API_V1}/auth/verify`,
    GOOGLE: `${API_V1}/auth/google`,
    FORGOT_PASSWORD: `${API_V1}/auth/forgot-password`,
    RESET_PASSWORD: `${API_V1}/auth/reset-password`,
  },
  USERS: {
    LIST: `${API_V1}/users`,
    DETAIL: (id: string) => `${API_V1}/users/${id}`,
    UPDATE_STATUS: (id: string) => `${API_V1}/users/${id}/status`,
  },
  FAQS: {
    LIST: `${API_V1}/faqs`,
    CREATE: `${API_V1}/faqs`,
    DETAIL: (id: string) => `${API_V1}/faqs/${id}`,
    UPDATE: (id: string) => `${API_V1}/faqs/${id}`,
    DELETE: (id: string) => `${API_V1}/faqs/${id}`,
  },
  PUBLIC_FAQS: {
    LIST: `${API_V1}/public/faqs`,
  },
  MEALS: {
    LIST: `${API_V1}/meals`,
    CREATE: `${API_V1}/meals`,
    DETAIL: (id: string) => `${API_V1}/meals/${id}`,
    UPDATE: (id: string) => `${API_V1}/meals/${id}`,
    DELETE: (id: string) => `${API_V1}/meals/${id}`,
  },
  IMAGES: {
    UPLOAD_MEAL: `${API_V1}/images/upload/meal`,
  },
  ZONES: {
    LIST: `${API_V1}/zones`,
    CREATE: `${API_V1}/zones`,
    DETAIL: (id: string) => `${API_V1}/zones/${id}`,
    UPDATE: (id: string) => `${API_V1}/zones/${id}`,
    DELETE: (id: string) => `${API_V1}/zones/${id}`,
  },
  LOCATIONS: {
    LIST: `${API_V1}/locations`,
    CREATE: `${API_V1}/locations`,
    DETAIL: (id: string) => `${API_V1}/locations/${id}`,
    UPDATE: (id: string) => `${API_V1}/locations/${id}`,
    DELETE: (id: string) => `${API_V1}/locations/${id}`,
    SET_DEFAULT: (id: string) => `${API_V1}/locations/${id}/default`,
  },
  PACKAGES: {
    LIST: `${API_V1}/packages`,
    CREATE: `${API_V1}/packages`,
    DETAIL: (id: string) => `${API_V1}/packages/${id}`,
    UPDATE: (id: string) => `${API_V1}/packages/${id}`,
    DELETE: (id: string) => `${API_V1}/packages/${id}`,
    PLANS: (id: string) => `${API_V1}/packages/${id}/plans`,
    UNASSIGN_PLAN: (id: string, planId: string) => `${API_V1}/packages/${id}/plans/${planId}`,
    UPDATE_PLAN_PRICE: (id: string, planId: string) => `${API_V1}/packages/${id}/plans/${planId}/price`,
  },
  PUBLIC_PACKAGES: {
    LIST: `${API_V1}/public/packages`,
    DETAIL: (id: string) => `${API_V1}/public/packages/${id}`,
  },
  SUBSCRIPTION_PLANS: {
    LIST: `${API_V1}/subscription-plans`,
    CREATE: `${API_V1}/subscription-plans`,
    DETAIL: (id: string) => `${API_V1}/subscription-plans/${id}`,
    UPDATE: (id: string) => `${API_V1}/subscription-plans/${id}`,
    DELETE: (id: string) => `${API_V1}/subscription-plans/${id}`,
    UPDATE_STATUS: (id: string) => `${API_V1}/subscription-plans/${id}/status`,
  },
  MENUS: {
    LIST: `${API_V1}/menus`,
    CREATE: `${API_V1}/menus`,
    UNASSIGNED_MEALS: `${API_V1}/menus/meals/unassigned`,
    PACKAGE_MEALS: (packageId: string) => `${API_V1}/menus/packages/${packageId}/meals`,
    PACKAGE_MENUS: (packageId: string) => `${API_V1}/menus/packages/${packageId}`,
    DETAIL: (id: string) => `${API_V1}/menus/${id}`,
    UPDATE: (id: string) => `${API_V1}/menus/${id}`,
    DELETE: (id: string) => `${API_V1}/menus/${id}`,
  },
  DISCOUNTS: {
    LIST: `${API_V1}/discounts`,
    CREATE: `${API_V1}/discounts`,
    DETAIL: (id: string) => `${API_V1}/discounts/${id}`,
    UPDATE: (id: string) => `${API_V1}/discounts/${id}`,
    DELETE: (id: string) => `${API_V1}/discounts/${id}`,
    UPDATE_STATUS: (id: string) => `${API_V1}/discounts/${id}/status`,
    ASSIGNED_PACKAGES: (id: string) => `${API_V1}/discounts/${id}/packages`,
    ASSIGN_PACKAGES: (id: string) => `${API_V1}/discounts/${id}/packages`,
    UNASSIGN_PACKAGE: (id: string, packageId: string) => `${API_V1}/discounts/${id}/packages/${packageId}`,
  },
  INVOICES: {
    LIST: `${API_V1}/invoices`,
    DETAIL: (id: string) => `${API_V1}/invoices/${id}`,
    VOID: (id: string) => `${API_V1}/invoices/${id}/void`,
  },
  PAYMENT_METHODS: {
    LIST: `${API_V1}/payment-methods`,
    DETAIL: (id: string) => `${API_V1}/payment-methods/${id}`,
    SET_DEFAULT: (id: string) => `${API_V1}/payment-methods/${id}/default`,
    DELETE: (id: string) => `${API_V1}/payment-methods/${id}`,
  },
  SUBSCRIPTIONS: {
    LIST: `${API_V1}/subscriptions`,
    CREATE: `${API_V1}/subscriptions`,
    DETAIL: (id: string) => `${API_V1}/subscriptions/${id}`,
    CANCEL: (id: string) => `${API_V1}/subscriptions/${id}/cancel`,
    CANCEL_RENEWAL: (id: string) => `${API_V1}/subscriptions/${id}/cancel-renewal`,
    INVOICES: (id: string) => `${API_V1}/subscriptions/${id}/invoices`,
    INVOICE_DETAIL: (id: string, invId: string) => `${API_V1}/subscriptions/${id}/invoices/${invId}`,
    PAYMENTS: (id: string) => `${API_V1}/subscriptions/${id}/payments`,
    BILLING_HISTORY: (id: string) => `${API_V1}/subscriptions/${id}/billing-history`,
    RETRY_BILLING: (id: string) => `${API_V1}/subscriptions/${id}/retry-billing`,
  },
} as const;

export type BackendEndpoints = typeof BACKEND_ENDPOINTS;
