/**
 * Environment variable access with required-variable checks.
 *
 * Server-side secrets throw at import time if missing in production,
 * preventing the app from running with empty/default values.
 */

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value) return value;
  if (fallback !== undefined) return fallback;
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Required environment variable ${name} is not set.`);
  }
  console.warn(`[env] ${name} is not set — using empty default (dev only).`);
  return "";
}

// ─── Server-side environment variables ───
export const serverEnv = {
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_REFRESH_SECRET: requireEnv("JWT_REFRESH_SECRET"),
  CSRF_SECRET: requireEnv("CSRF_SECRET"),
  API_INTERNAL_URL:
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    (process.env.NODE_ENV === "production"
      ? (() => { throw new Error("Required environment variable API_INTERNAL_URL or NEXT_PUBLIC_BACKEND_URL is not set."); })()
      : "http://localhost:3001/api"),
  REVALIDATION_SECRET: requireEnv("REVALIDATION_SECRET"),
} as const;

// ─── Client-side environment variables ───
export const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Nu3Go",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
  NEXT_PUBLIC_BACKEND_URL: requireEnv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:3001"),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
} as const;
