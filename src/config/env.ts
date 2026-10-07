/**
 * Environment variable validation using Zod.
 * Validates at build time / server startup to catch missing variables early.
 *
 * NOTE: This file will use Zod for validation once the dependency is installed.
 * For now, it provides typed access to environment variables.
 */

// ─── Server-side environment variables ───
export const serverEnv = {
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  CSRF_SECRET: process.env.CSRF_SECRET!,
  API_INTERNAL_URL: process.env.API_INTERNAL_URL!,
  REVALIDATION_SECRET: process.env.REVALIDATION_SECRET!,
} as const;

// ─── Client-side environment variables ───
export const clientEnv = {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME!,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL!,
} as const;
