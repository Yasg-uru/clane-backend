import { z } from "zod";

const trimmedString = (message: string) =>
  z.string().min(1, message).transform((v) => v.trim());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must include an uppercase letter")
  .regex(/[a-z]/, "Must include a lowercase letter")
  .regex(/[0-9]/, "Must include a number")
  .regex(/[^A-Za-z0-9]/, "Must include a special character");

// ── Profile (shared base) ────────────────────────────────────────────────────

const profileBaseSchema = z.object({
  fullName: trimmedString("Full name is required"),
  city: trimmedString("City is required"),
});

export const creatorProfileSchema = profileBaseSchema.extend({
  niche: z.array(z.string().min(1)).min(1, "Add at least one niche"),
});

export const brandProfileSchema = profileBaseSchema.extend({
  brandName: trimmedString("Brand name is required"),
  brandType: trimmedString("Brand type is required"),
});

// ── Security ─────────────────────────────────────────────────────────────────

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from the current one",
    path: ["newPassword"],
  });

// ── Account deletion confirmation ────────────────────────────────────────────

export const deleteAccountSchema = z.object({
  confirmation: z.literal("DELETE"),
});

export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
export type BrandProfileInput = z.infer<typeof brandProfileSchema>;
export type UpdateProfileInput = CreatorProfileInput | BrandProfileInput;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
