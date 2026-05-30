import { Schema, model, type HydratedDocument } from "mongoose";
import { UserRole, AuthProvider } from "../core/types";

export interface Brand {
  role: UserRole.Brand;
  fullName: string;
  email: string;
  passwordHash?: string | null;
  city?: string;
  brandName?: string;
  brandType?: string;
  instagramHandle?: string;
  instagramFollowers?: number;
  instagramBio?: string;
  isEmailVerified: boolean;
  refreshToken?: string | null;
  authProvider: AuthProvider;
  authProviders: string[];
  googleId?: string;
  googleEmail?: string;
  googleConnected: boolean;
  instagramId?: string;
  instagramConnected: boolean;
  instagramAccessToken?: string;
  instagramTokenExpiresAt?: Date;
  profilePhotoUrl?: string;
  isProfileComplete: boolean;
  rawSocialProfile?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type BrandDocument = HydratedDocument<Brand>;

const brandSchema = new Schema<Brand>(
  {
    role: {
      type: String,
      enum: [UserRole.Brand],
      default: UserRole.Brand,
      required: true,
      immutable: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null, select: false },
    city: { type: String, trim: true },
    brandName: { type: String, trim: true },
    brandType: { type: String, trim: true },
    instagramHandle: { type: String, trim: true },
    instagramFollowers: { type: Number, min: 0 },
    instagramBio: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null, select: false },
    authProvider: {
      type: String,
      enum: Object.values(AuthProvider),
      default: AuthProvider.Email,
      required: true,
    },
    authProviders: { type: [String], default: [] },
    googleId: { type: String, sparse: true, unique: true },
    googleEmail: { type: String, lowercase: true, trim: true },
    googleConnected: { type: Boolean, default: false },
    instagramId: { type: String, sparse: true, unique: true },
    instagramConnected: { type: Boolean, default: false },
    instagramAccessToken: { type: String, select: false },
    instagramTokenExpiresAt: { type: Date },
    profilePhotoUrl: { type: String },
    isProfileComplete: { type: Boolean, default: false },
    rawSocialProfile: { type: Schema.Types.Mixed, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Partial<Brand> & { _id?: object; __v?: number }) => {
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

export const BrandModel = model<Brand>("Brand", brandSchema);
