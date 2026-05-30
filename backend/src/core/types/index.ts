import type { BrandDocument } from "../../models/Brand.model";
import type { CreatorDocument } from "../../models/Creator.model";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude] — GeoJSON standard
}

export interface MatchScoreResult {
  matchScore: number;
  matchBreakdown: {
    nicheScore: number;
    platformScore: number;
    followerScore: number;
    locationScore: number;
    requirementsScore: number;
    proximityScore: number;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export enum UserRole {
  Brand = "brand",
  Creator = "creator",
}

export enum AuthProvider {
  Email = "email",
  Instagram = "instagram",
  Google = "google",
  Both = "both",
}

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

export type SocialProvider = "google" | "instagram";

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
  role: UserRole.Brand;
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
  role: UserRole.Creator;
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
