import { z } from "zod";
import { emailSchema, passwordSchema, phoneSchema, otpSchema } from "./common.schema";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: emailSchema,
  phone: phoneSchema,
  address: z.string().min(1, "Address is required").max(500),
  city: z.string().min(1, "City is required").max(100),
  password: passwordSchema,
});

export const googleLoginSchema = z.object({
  id_token: z.string().min(1, "Google ID token is required"),
});

export const verifySchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  new_password: passwordSchema,
  otp: otpSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
