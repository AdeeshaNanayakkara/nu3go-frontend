/**
 * Application route path constants.
 * Use these instead of hardcoded strings for type-safe navigation.
 */
export const ROUTES = {
  // ─── Public ───
  HOME: "/",
  PLANS: "/plans",
  SERVICES: "/services",
  MENU: "/services",
  SERVICE_DETAIL: (slug: string) => `/services/${slug}` as const,
  CATEGORIES: "/categories",
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}` as const,
  SEARCH: "/search",
  BLOG: "/blog",
  BLOG_ARTICLE: (slug: string) => `/blog/${slug}` as const,
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQ: "/faq",

  // ─── Auth ───
  LOGIN: "/login",
  REGISTER: "/register",
  SIGNUP: "/signup",
  ADMIN_LOGIN: "/admin/login",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // ─── User (Protected) ───
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  PROFILE_EDIT: "/profile/edit",
  PAYMENTS: "/payments",
  PAYMENT_DETAIL: (id: string) => `/payments/${id}` as const,
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}` as const,
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",

  // ─── Admin (Protected) ───
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAIL: (id: string) => `/admin/users/${id}` as const,
  ADMIN_SERVICES: "/admin/services",
  ADMIN_SERVICE_NEW: "/admin/services/new",
  ADMIN_SERVICE_EDIT: (id: string) => `/admin/services/${id}/edit` as const,
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: (id: string) => `/admin/orders/${id}` as const,
  ADMIN_SETTINGS: "/admin/settings",
} as const;

/**
 * Route arrays for middleware route protection.
 */
export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.PLANS,
  ROUTES.SERVICES,
  ROUTES.CATEGORIES,
  ROUTES.SEARCH,
  ROUTES.BLOG,
  ROUTES.ABOUT,
  ROUTES.CONTACT,
  ROUTES.FAQ,
] as const;

export const AUTH_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.SIGNUP,
  ROUTES.ADMIN_LOGIN,
  ROUTES.VERIFY_EMAIL,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
] as const;

export const USER_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
  ROUTES.PAYMENTS,
  ROUTES.ORDERS,
  ROUTES.SETTINGS,
  ROUTES.NOTIFICATIONS,
] as const;

export const ADMIN_ROUTES = [
  ROUTES.ADMIN_DASHBOARD,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_SERVICES,
  ROUTES.ADMIN_ORDERS,
  ROUTES.ADMIN_SETTINGS,
] as const;
