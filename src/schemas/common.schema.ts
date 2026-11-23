import { z } from "zod";

export const emailSchema = z.string().email("Invalid email address").max(254);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long");

export const phoneSchema = z
  .string()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long");

export const otpSchema = z
  .string()
  .min(4, "OTP code is too short")
  .max(8, "OTP code is too long");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(12),
});
