import { Schema, model, type HydratedDocument } from "mongoose";
import { UserRole, AuthProvider, AuthenticityRisk } from "../core/types";
import type { GeoPoint } from "../core/types";

export { AuthenticityRisk };

export interface Creator {
  role: UserRole.Creator;
  fullName: string;
  email: string;
  passwordHash: string | null;
  city: string;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  isEmailVerified: boolean;
  refreshToken?: string | null;
  authProvider: AuthProvider;
  authProviders: AuthProvider[];
  instagramId?: string;
  instagramBio?: string;
  instagramProfilePicUrl?: string;
  instagramAccessToken?: string;
  instagramTokenExpiresAt?: Date;
  instagramConnected: boolean;
  instagramVerified: boolean;
  instagramDataLastRefreshedAt?: Date;
  // Instagram engagement metrics (fetched async by InstagramDataWorker)
  instagramPostCount?: number;
  instagramAvgLikes?: number;
  instagramAvgComments?: number;
  instagramEngagementRate?: number;
  instagramDataFetchedAt?: Date;
  // Instagram authenticity score (computed async by AuthenticityScoreWorker)
  instagramAuthenticityScore?: number;
  instagramAuthenticityRisk?: AuthenticityRisk;
  // YouTube platform data
  youtubeChannelId?: string;
  youtubeConnected: boolean;
  youtubeAccessToken?: string;
  youtubeRefreshToken?: string;
  youtubeTokenExpiresAt?: Date;
  // YouTube engagement metrics (fetched async by YoutubeDataWorker)
  youtubeSubscriberCount?: number;
  youtubeVideoCount?: number;
  youtubeTotalViewCount?: number;
  youtubeAvgViews?: number;
  youtubeAvgLikes?: number;
  youtubeAvgComments?: number;
  youtubeEngagementRate?: number;
  youtubeDataFetchedAt?: Date;
  youtubeDataLastRefreshedAt?: Date;
  // YouTube authenticity score (computed async by AuthenticityScoreWorker)
  youtubeAuthenticityScore?: number;
  youtubeAuthenticityRisk?: AuthenticityRisk;
  // Google OAuth
  googleId?: string;
  googleEmail?: string;
  googleConnected: boolean;
  isProfileComplete: boolean;
  rawSocialProfile?: Record<string, unknown>;
  location?: GeoPoint;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreatorDocument = HydratedDocument<Creator>;

const geoPointSchema = new Schema<GeoPoint>(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const creatorSchema = new Schema<Creator>(
  {
    role: {
      type: String,
      enum: [UserRole.Creator],
      default: UserRole.Creator,
      required: true,
      immutable: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null, select: false },
    city: { type: String, required: true, trim: true },
    instagramHandle: { type: String, required: true, trim: true, unique: true, index: true },
    instagramFollowers: { type: Number, required: true, min: 0 },
    niche: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one niche is required",
      },
    },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.Email,
      required: true,
    },
    authProviders: { type: [String], enum: Object.values(AuthProvider), default: [] },
    instagramId: { type: String, sparse: true, unique: true },
    instagramBio: { type: String },
    instagramProfilePicUrl: { type: String },
    instagramAccessToken: { type: String, select: false },
    instagramTokenExpiresAt: { type: Date },
    instagramConnected: { type: Boolean, default: false },
    instagramVerified: { type: Boolean, default: false },
    instagramDataLastRefreshedAt: { type: Date },
    instagramPostCount: { type: Number, min: 0 },
    instagramAvgLikes: { type: Number, min: 0 },
    instagramAvgComments: { type: Number, min: 0 },
    instagramEngagementRate: { type: Number, min: 0 },
    instagramDataFetchedAt: { type: Date },
    instagramAuthenticityScore: { type: Number, min: 0, max: 100 },
    instagramAuthenticityRisk: { type: String, enum: Object.values(AuthenticityRisk) },
    youtubeChannelId: { type: String, sparse: true, unique: true },
    youtubeConnected: { type: Boolean, default: false },
    youtubeAccessToken: { type: String, select: false },
    youtubeRefreshToken: { type: String, select: false },
    youtubeTokenExpiresAt: { type: Date },
    youtubeSubscriberCount: { type: Number, min: 0 },
    youtubeVideoCount: { type: Number, min: 0 },
    youtubeTotalViewCount: { type: Number, min: 0 },
    youtubeAvgViews: { type: Number, min: 0 },
    youtubeAvgLikes: { type: Number, min: 0 },
    youtubeAvgComments: { type: Number, min: 0 },
    youtubeEngagementRate: { type: Number, min: 0 },
    youtubeDataFetchedAt: { type: Date },
    youtubeDataLastRefreshedAt: { type: Date },
    youtubeAuthenticityScore: { type: Number, min: 0, max: 100 },
    youtubeAuthenticityRisk: { type: String, enum: Object.values(AuthenticityRisk) },
    googleId: { type: String, sparse: true, unique: true },
    googleEmail: { type: String, lowercase: true, trim: true },
    googleConnected: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    rawSocialProfile: { type: Schema.Types.Mixed, select: false },
    location: { type: geoPointSchema },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (
        _doc,
        ret: Partial<Creator> & { _id?: object; __v?: number },
      ) => {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.instagramAccessToken;
        delete ret.youtubeAccessToken;
        delete ret.youtubeRefreshToken;
        delete ret.rawSocialProfile;
        delete ret.__v;
        return ret;
      },
    },
  },
);

creatorSchema.index({ location: "2dsphere" }, { sparse: true });

export const CreatorModel = model<Creator>("Creator", creatorSchema);
