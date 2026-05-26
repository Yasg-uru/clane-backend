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

export const USER_ROLES = ["brand", "creator"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthProvider = "email" | "instagram" | "google" | "both";

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
  createdAt?: string;
  updatedAt?: string;
}

export interface SafeBrand extends SafeUserBase {
  role: "brand";
  brandName: string;
  brandType: string;
  instagramHandle?: string;
  profilePhotoUrl?: string;
  googleConnected: boolean;
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
}

export type SafeUser = SafeBrand | SafeCreator;
