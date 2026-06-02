import { z } from "zod";
import { USER_ROLES } from "@/config/roles.config";

const trimmedString = (message: string) =>
  z.string().min(1, message).transform((v) => v.trim());

const emailSchema = z
  .string()
  .email("A valid email is required")
  .transform((v) => v.trim().toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

const instagramOptionalSchema = z
  .string()
  .refine(
    (v) => v === "" || /^@?[a-zA-Z0-9._]+$/.test(v),
    "Invalid Instagram handle format",
  );

const roleSchema = z.enum(USER_ROLES);

export const brandRegisterSchema = z.object({
  fullName: trimmedString("Full name is required"),
  email: emailSchema,
  password: passwordSchema,
  city: trimmedString("City is required"),
  brandName: trimmedString("Brand name is required"),
  brandType: trimmedString("Brand type is required"),
  instagramHandle: instagramOptionalSchema,
});

export const creatorRegisterSchema = z.object({
  fullName: trimmedString("Full name is required"),
  email: emailSchema,
  password: passwordSchema,
  city: trimmedString("City is required"),
  instagramHandle: z
    .string()
    .min(1, "Instagram handle is required")
    .regex(/^@?[a-zA-Z0-9._]+$/, "Invalid Instagram handle format")
    .transform((v) => v.trim()),
  instagramFollowers: z
    .number({ error: "Must be a number" })
    .int("Must be an integer")
    .min(0, "Cannot be negative"),
  niche: z.array(z.string().min(1)).min(1, "At least one niche is required"),
});

export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
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

export const brandCompleteProfileSchema = z.object({
  brandName: trimmedString("Brand name is required"),
  brandType: trimmedString("Brand type is required"),
  city: trimmedString("City is required"),
});

export const creatorCompleteProfileSchema = z.object({
  instagramHandle: z
    .string()
    .min(1, "Instagram handle is required")
    .regex(/^@?[a-zA-Z0-9._]+$/, "Invalid Instagram handle format")
    .transform((v) => v.trim()),
  instagramFollowers: z
    .number({ error: "Must be a number" })
    .int("Must be an integer")
    .min(0, "Cannot be negative"),
  niche: z.array(z.string().min(1)).min(1, "At least one niche is required"),
  city: trimmedString("City is required"),
});

export const submitInstagramEmailSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  role: roleSchema,
});

export const resetPasswordFormSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
export type BrandRegisterInput = z.infer<typeof brandRegisterSchema>;
export type CreatorRegisterInput = z.infer<typeof creatorRegisterSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResendOtpInput = z.infer<typeof resendOtpSchema>;
export type BrandCompleteProfileInput = z.infer<typeof brandCompleteProfileSchema>;
export type CreatorCompleteProfileInput = z.infer<typeof creatorCompleteProfileSchema>;
export type SubmitInstagramEmailInput = z.infer<typeof submitInstagramEmailSchema>;
