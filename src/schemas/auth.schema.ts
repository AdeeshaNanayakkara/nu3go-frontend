/**
 * Authentication Zod validation schemas.
 */

// TODO: Install zod, then implement:
// import { z } from "zod";
// import { emailSchema, passwordSchema } from "./common.schema";
//
// export const loginSchema = z.object({
//   email: emailSchema,
//   password: z.string().min(1, "Password is required"),
// });
//
// export const registerSchema = z
//   .object({
//     name: z.string().min(2, "Name must be at least 2 characters"),
//     email: emailSchema,
//     password: passwordSchema,
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });
//
// export const forgotPasswordSchema = z.object({
//   email: emailSchema,
// });
//
// export const resetPasswordSchema = z
//   .object({
//     password: passwordSchema,
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });
//
// export type LoginInput = z.infer<typeof loginSchema>;
// export type RegisterInput = z.infer<typeof registerSchema>;
// export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
// export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export {};
