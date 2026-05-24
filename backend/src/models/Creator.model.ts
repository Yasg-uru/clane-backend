import { Schema, model, type HydratedDocument } from "mongoose";
import type { AuthProvider } from "../core/types";

export interface Creator {
  role: "creator";
  fullName: string;
  email: string;
  passwordHash?: string | null;
  city?: string;
  instagramHandle?: string;
  instagramFollowers?: number;
  niche?: string[];
  isEmailVerified: boolean;
  refreshToken?: string | null;
  authProvider: AuthProvider;
  authProviders: string[];
  googleId?: string;
  googleConnected: boolean;
  instagramId?: string;
  instagramBio?: string;
  instagramProfilePicUrl?: string;
  instagramAccessToken?: string;
  instagramTokenExpiresAt?: Date;
  instagramConnected: boolean;
  instagramVerified: boolean;
  instagramDataLastRefreshedAt?: Date;
  isProfileComplete: boolean;
  rawSocialProfile?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreatorDocument = HydratedDocument<Creator>;

const creatorSchema = new Schema<Creator>(
  {
    role: {
      type: String,
      enum: ["creator"],
      default: "creator",
      required: true,
      immutable: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null, select: false },
    city: { type: String, trim: true },
    instagramHandle: { type: String, trim: true, sparse: true, unique: true },
    instagramFollowers: { type: Number, min: 0 },
    niche: { type: [String] },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },
    authProvider: {
      type: String,
      enum: ["email", "instagram", "google", "both"],
      default: "email",
      required: true,
    },
    authProviders: { type: [String], default: [] },
    googleId: { type: String, sparse: true, unique: true },
    googleConnected: { type: Boolean, default: false },
    instagramId: { type: String, sparse: true, unique: true },
    instagramBio: { type: String },
    instagramProfilePicUrl: { type: String },
    instagramAccessToken: { type: String, select: false },
    instagramTokenExpiresAt: { type: Date },
    instagramConnected: { type: Boolean, default: false },
    instagramVerified: { type: Boolean, default: false },
    instagramDataLastRefreshedAt: { type: Date },
    isProfileComplete: { type: Boolean, default: false },
    rawSocialProfile: { type: Schema.Types.Mixed, select: false },
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
        delete ret.rawSocialProfile;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const CreatorModel = model<Creator>("Creator", creatorSchema);
