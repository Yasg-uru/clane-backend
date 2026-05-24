import { Schema, model, type HydratedDocument } from "mongoose";
import type { AuthProvider } from "../core/types";

export interface Creator {
  role: "creator";
  fullName: string;
  email: string;
  passwordHash: string;
  city: string;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  isEmailVerified: boolean;
  refreshToken?: string | null;
  authProvider: AuthProvider;
  instagramId?: string;
  instagramBio?: string;
  instagramProfilePicUrl?: string;
  instagramAccessToken?: string;
  instagramTokenExpiresAt?: Date;
  instagramConnected: boolean;
  instagramVerified: boolean;
  instagramDataLastRefreshedAt?: Date;
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
    passwordHash: { type: String, required: true, select: false },
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
      enum: ["email", "instagram", "google", "both"],
      default: "email",
      required: true,
    },
    instagramId: { type: String, sparse: true, unique: true },
    instagramBio: { type: String },
    instagramProfilePicUrl: { type: String },
    instagramAccessToken: { type: String, select: false },
    instagramTokenExpiresAt: { type: Date },
    instagramConnected: { type: Boolean, default: false },
    instagramVerified: { type: Boolean, default: false },
    instagramDataLastRefreshedAt: { type: Date },
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
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const CreatorModel = model<Creator>("Creator", creatorSchema);
