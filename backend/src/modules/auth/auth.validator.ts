import { z } from "zod";
import { UserRole } from "../../core/types";

// Rejects < and > to block embedded HTML/script tags (defense-in-depth against XSS).
const NO_HTML_RE = /^[^<>]*$/;

const trimmedString = (message: string) => {
  return z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(1, message).regex(NO_HTML_RE, "Invalid characters"),
  );
};

const emailSchema = z
  .preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().email("A valid email is required"),
  )
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must include an uppercase letter")
  .regex(/[a-z]/, "Password must include a lowercase letter")
  .regex(/[0-9]/, "Password must include a number")
  .regex(/[^A-Za-z0-9]/, "Password must include a special character");

// Instagram handles: optional @-prefix, then letters/numbers/underscores/periods only.
const instagramHandleSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().min(1).regex(/^@?[a-zA-Z0-9._]+$/, "Invalid Instagram handle format").optional());

const roleSchema = z.nativeEnum(UserRole);

export const brandRegisterSchema = z.object({
  fullName: trimmedString("Full name is required"),
  email: emailSchema,
  password: passwordSchema,
  city: trimmedString("City is required"),
  brandName: trimmedString("Brand name is required"),
  brandType: trimmedString("Brand type is required"),
  instagramHandle: instagramHandleSchema,
});

export const creatorRegisterSchema = z.object({
  fullName: trimmedString("Full name is required"),
  email: emailSchema,
  password: passwordSchema,
  city: trimmedString("City is required"),
  instagramHandle: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(1, "Instagram handle is required").regex(/^@?[a-zA-Z0-9._]+$/, "Invalid Instagram handle format"),
  ),
  instagramFollowers: z
    .number()
    .int("Instagram followers must be an integer")
    .min(0, "Instagram followers cannot be negative"),
  niche: z
    .array(trimmedString("Niche cannot be empty"))
    .min(1, "At least one niche is required"),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().regex(/^\d{6}$/, "OTP must be a 6-digit code"),
  ),
  role: roleSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  role: roleSchema,
});

export const resendOtpSchema = z.object({
  email: emailSchema,
  role: roleSchema,
});

export const socialCallbackSchema = z.object({
  code: z.string().min(1, "OAuth code is required"),
  state: z.string().min(1, "OAuth state is required"),
});

export const submitInstagramEmailSchema = z.object({
  email: emailSchema,
});

export const brandCompleteProfileSchema = z.object({
  fullName: trimmedString("Full name is required").optional(),
  city: trimmedString("City is required").optional(),
  brandName: trimmedString("Brand name is required").optional(),
  brandType: trimmedString("Brand type is required").optional(),
  instagramHandle: instagramHandleSchema,
});

export const creatorCompleteProfileSchema = z.object({
  fullName: trimmedString("Full name is required").optional(),
  city: trimmedString("City is required").optional(),
  instagramHandle: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().min(1, "Instagram handle is required").regex(/^@?[a-zA-Z0-9._]+$/, "Invalid Instagram handle format").optional(),
  ),
  instagramFollowers: z
    .number()
    .int("Instagram followers must be an integer")
    .min(0, "Instagram followers cannot be negative")
    .optional(),
  niche: z
    .array(trimmedString("Niche cannot be empty"))
    .min(1, "At least one niche is required")
    .optional(),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  role: roleSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordSchema,
  role: roleSchema,
});

export type BrandRegisterInput = z.infer<typeof brandRegisterSchema>;
export type CreatorRegisterInput = z.infer<typeof creatorRegisterSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type SocialCallbackInput = z.infer<typeof socialCallbackSchema>;
export type SubmitInstagramEmailInput = z.infer<typeof submitInstagramEmailSchema>;
export type BrandCompleteProfileInput = z.infer<typeof brandCompleteProfileSchema>;
export type CreatorCompleteProfileInput = z.infer<typeof creatorCompleteProfileSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
