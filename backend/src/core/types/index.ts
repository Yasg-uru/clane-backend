import type { BrandDocument } from "../../models/Brand.model";
import type { CreatorDocument } from "../../models/Creator.model";

export const USER_ROLES = ["brand", "creator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthProvider = "email" | "instagram" | "google" | "both";
export type SocialProvider = "google" | "instagram";

export type SocialAuthStatus =
  | "AUTHENTICATED"
  | "PENDING_EMAIL_SUBMISSION"
  | "PENDING_EMAIL_VERIFICATION"
  | "PROFILE_INCOMPLETE";

export type AuthDocument = BrandDocument | CreatorDocument;

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
  jti?: string;
  exp?: number;
  purpose?: "email_verification" | "profile_completion";
}

export interface SocialProfile {
  provider: SocialProvider;
  providerId: string;
  email: string | null;
  fullName: string;
  profilePhotoUrl: string | null;
  instagramHandle: string | null;
  instagramFollowers: number | null;
  instagramBio: string | null;
  instagramAccessToken: string | null;
  instagramTokenExpiresAt: Date | null;
  rawProfile: Record<string, unknown>;
}

export interface InstagramProfile {
  instagramId: string;
  instagramHandle: string;
  instagramBio: string;
  instagramProfilePicUrl: string;
  instagramFollowers: number;
}

export interface GoogleProfile {
  googleId: string;
  googleEmail: string;
  fullName: string;
  profilePhotoUrl: string;
}

interface SafeUserBase {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  city: string;
  isEmailVerified: boolean;
  authProvider: AuthProvider;
  authProviders: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeBrand extends SafeUserBase {
  role: "brand";
  brandName: string;
  brandType: string;
  instagramHandle?: string;
  instagramFollowers?: number;
  instagramBio?: string;
  profilePhotoUrl?: string;
  googleConnected: boolean;
  instagramConnected: boolean;
  isProfileComplete: boolean;
}

export interface SafeCreator extends SafeUserBase {
  role: "creator";
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  instagramProfilePicUrl?: string;
  instagramConnected: boolean;
  instagramVerified: boolean;
  instagramDataLastRefreshedAt?: string;
  googleConnected: boolean;
  isProfileComplete: boolean;
}

export type SafeUser = SafeBrand | SafeCreator;

export interface SocialAuthResult {
  status: "authenticated" | "pending_email_verification" | "profile_incomplete" | "pending_email_submission";
  accessToken: string | null;
  refreshToken: string | null;
  intermediateToken: string | null;
  user: SafeUser | null;
  instagramTokenExpiringSoon?: boolean;
  instagramTokenExpired?: boolean;
}
