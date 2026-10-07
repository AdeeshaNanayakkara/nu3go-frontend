/**
 * Common reusable Zod schema fragments.
 *
 * NOTE: Zod needs to be installed. These are placeholder schemas
 * that will work once `zod` is added as a dependency.
 */

// TODO: Install zod, then uncomment:
// import { z } from "zod";
//
// export const emailSchema = z.string().email("Invalid email address");
//
// export const passwordSchema = z
//   .string()
//   .min(8, "Password must be at least 8 characters")
//   .regex(/[A-Z]/, "Must contain at least one uppercase letter")
//   .regex(/[a-z]/, "Must contain at least one lowercase letter")
//   .regex(/[0-9]/, "Must contain at least one number");
//
// export const phoneSchema = z
//   .string()
//   .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
//   .optional();
//
// export const paginationSchema = z.object({
//   page: z.coerce.number().int().positive().default(1),
//   pageSize: z.coerce.number().int().positive().max(100).default(12),
// });

export {};
