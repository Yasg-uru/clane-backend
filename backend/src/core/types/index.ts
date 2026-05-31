import type { Types } from "mongoose";
import type { BrandDocument } from "../../models/Brand.model";
import type { CreatorDocument } from "../../models/Creator.model";

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude] — GeoJSON standard
}

/**
 * Typed write payload for repository create/update.
 *
 * Every field is optional (partial write), and any `Types.ObjectId` foreign-key
 * field is widened to also accept a `string` — services pass string ids and
 * Mongoose casts them. This replaces `Partial<Record<string, unknown>>`, so a
 * typo'd field name or wrong-typed scalar is now a compile error.
 */
export type WriteData<T> = {
  [K in keyof T]?: T[K] extends Types.ObjectId ? Types.ObjectId | string : T[K];
};

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
  Youtube = "youtube",
  Both = "both",
}

export enum SocialProvider {
  Google = "google",
  Instagram = "instagram",
  Youtube = "youtube",
}

export enum SocialAuthStatus {
  Authenticated = "authenticated",
  PendingEmailVerification = "pending_email_verification",
  ProfileIncomplete = "profile_incomplete",
  PendingEmailSubmission = "pending_email_submission",
}

export enum AuthenticityRisk {
  Low = "low",
  Medium = "medium",
  High = "high",
}

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
  youtubeChannelId: string | null;
  youtubeAccessToken: string | null;
  youtubeRefreshToken: string | null;
  youtubeTokenExpiresAt: Date | null;
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
  authProviders: AuthProvider[];
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
  instagramConnected?: boolean;
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
  instagramAuthenticityScore?: number;
  instagramAuthenticityRisk?: AuthenticityRisk;
  youtubeConnected: boolean;
  youtubeChannelId?: string;
  youtubeSubscriberCount?: number;
  youtubeAuthenticityScore?: number;
  youtubeAuthenticityRisk?: AuthenticityRisk;
  googleConnected: boolean;
  isProfileComplete: boolean;
}

export type SafeUser = SafeBrand | SafeCreator;

export interface SocialAuthResult {
  status: SocialAuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  intermediateToken: string | null;
  user: SafeUser | null;
  instagramTokenExpiringSoon?: boolean;
  instagramTokenExpired?: boolean;
}
