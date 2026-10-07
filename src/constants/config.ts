/**
 * Application-level configuration constants.
 */
export const APP_CONFIG = {
  /** Number of items per page in listings */
  PAGINATION_DEFAULT_PAGE_SIZE: 12,

  /** Maximum file upload size (in bytes) — 5MB */
  MAX_FILE_SIZE: 5 * 1024 * 1024,

  /** Accepted image file types */
  ACCEPTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],

  /** Debounce delay for search input (ms) */
  SEARCH_DEBOUNCE_MS: 300,

  /** Toast notification duration (ms) */
  TOAST_DURATION_MS: 5000,

  /** ISR revalidation intervals (seconds) */
  REVALIDATE: {
    SERVICES: 3600,       // 1 hour
    CATEGORIES: 3600,     // 1 hour
    BLOG: 1800,           // 30 minutes
    BLOG_ARTICLE: 3600,   // 1 hour
  },

  /** Cookie names */
  COOKIES: {
    ACCESS_TOKEN: "nu3go-access-token",
    REFRESH_TOKEN: "nu3go-refresh-token",
    CSRF_TOKEN: "nu3go-csrf-token",
    THEME: "nu3go-theme",
  },
} as const;
