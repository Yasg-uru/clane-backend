import { Schema, model, type HydratedDocument } from "mongoose";
import type { AuthProvider } from "../core/types";

export interface Brand {
  role: "brand";
  fullName: string;
  email: string;
  passwordHash: string;
  city: string;
  brandName: string;
  brandType: string;
  instagramHandle?: string;
  isEmailVerified: boolean;
  refreshToken?: string | null;
  authProvider: AuthProvider;
  googleId?: string;
  googleEmail?: string;
  googleConnected: boolean;
  profilePhotoUrl?: string;
  isProfileComplete: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BrandDocument = HydratedDocument<Brand>;

const brandSchema = new Schema<Brand>(
  {
    role: {
      type: String,
      enum: ["brand"],
      default: "brand",
      required: true,
      immutable: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    city: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    brandType: { type: String, required: true, trim: true },
    instagramHandle: { type: String, trim: true },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },
    authProvider: {
      type: String,
      enum: ["email", "instagram", "google", "both"],
      default: "email",
      required: true,
    },
    googleId: { type: String, sparse: true, unique: true },
    googleEmail: { type: String, lowercase: true, trim: true },
    googleConnected: { type: Boolean, default: false },
    profilePhotoUrl: { type: String },
    isProfileComplete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Partial<Brand> & { _id?: object; __v?: number }) => {
        delete ret.passwordHash;
        delete ret.refreshToken;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const BrandModel = model<Brand>("Brand", brandSchema);
