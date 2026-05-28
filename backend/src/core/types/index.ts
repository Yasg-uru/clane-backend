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
  role: UserRole.Brand;
  brandName: string;
  brandType: string;
  instagramHandle?: string;
  profilePhotoUrl?: string;
  googleConnected: boolean;
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
}

export type SafeUser = SafeBrand | SafeCreator;
