import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import type { GeoPoint } from "../core/types";

export type { GeoPoint };

export enum CampaignStatus {
  Draft = "draft",
  Active = "active",
  Closed = "closed",
  InProgress = "in_progress",
  Completed = "completed",
}

export enum CampaignPlatform {
  Instagram = "instagram",
  YouTube = "youtube",
  Both = "both",
}

export enum TargetGender {
  Male = "male",
  Female = "female",
  Any = "any",
}

export enum CampaignDeliveryType {
  Onsite = "onsite",
  Remote = "remote",
}

export interface ShootingLocation {
  geo: GeoPoint;
  radiusKm?: number;
}

export interface InstagramRequirements {
  minFollowers?: number;
  maxFollowers?: number;
  minAvgReelViews?: number;
  minAvgPostLikes?: number;
  minEngagementRate?: number; // e.g. 3.5 = 3.5%
  minPostsPerMonth?: number;
}

export interface YouTubeRequirements {
  minSubscribers?: number;
  maxSubscribers?: number;
  minAvgVideoViews?: number;
  minAvgLikes?: number;
  minVideosPerMonth?: number;
}

export interface CreatorRequirements {
  instagram?: InstagramRequirements;
  youtube?: YouTubeRequirements;
  minAge?: number;
  maxAge?: number;
  gender?: TargetGender;
  languages?: string[];
}

export interface ICampaign {
  brandId: Types.ObjectId;
  title: string;
  slug: string;
  platform: CampaignPlatform;
  niche: string[];
  targetLocation: string;
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: TargetGender;
  budgetAmount: number;
  deadline: Date;
  contentBrief: string;
  revisionRounds: 1 | 2;
  deliveryType: CampaignDeliveryType;
  shootingLocation?: ShootingLocation;
  creatorRequirements: CreatorRequirements;
  status: CampaignStatus;
  publishedAt: Date | null;
  closedAt: Date | null;
  totalBids: number;
  viewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CampaignDocument = HydratedDocument<ICampaign>;

// ─── Sub-schemas ─────────────────────────────────────────────────────────────

const geoPointSchema = new Schema<GeoPoint>(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const shootingLocationSchema = new Schema<ShootingLocation>(
  {
    geo: { type: geoPointSchema, required: true },
    radiusKm: { type: Number, min: 0, max: 500 },
  },
  { _id: false },
);

const instagramRequirementsSchema = new Schema<InstagramRequirements>(
  {
    minFollowers: { type: Number, min: 0 },
    maxFollowers: { type: Number, min: 0 },
    minAvgReelViews: { type: Number, min: 0 },
    minAvgPostLikes: { type: Number, min: 0 },
    minEngagementRate: { type: Number, min: 0, max: 100 },
    minPostsPerMonth: { type: Number, min: 0 },
  },
  { _id: false },
);

const youtubeRequirementsSchema = new Schema<YouTubeRequirements>(
  {
    minSubscribers: { type: Number, min: 0 },
    maxSubscribers: { type: Number, min: 0 },
    minAvgVideoViews: { type: Number, min: 0 },
    minAvgLikes: { type: Number, min: 0 },
    minVideosPerMonth: { type: Number, min: 0 },
  },
  { _id: false },
);

const creatorRequirementsSchema = new Schema<CreatorRequirements>(
  {
    instagram: { type: instagramRequirementsSchema },
    youtube: { type: youtubeRequirementsSchema },
    minAge: { type: Number, min: 13, max: 65 },
    maxAge: { type: Number, min: 13, max: 65 },
    gender: { type: String, enum: Object.values(TargetGender) },
    languages: { type: [String] },
  },
  { _id: false },
);

// ─── Campaign schema ──────────────────────────────────────────────────────────

const campaignSchema = new Schema<ICampaign>(
  {
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    platform: { type: String, enum: Object.values(CampaignPlatform), required: true, index: true },
    niche: { type: [String], required: true, index: true },
    targetLocation: { type: String, required: true, trim: true },
    targetAgeMin: { type: Number, required: true, min: 13, max: 65 },
    targetAgeMax: { type: Number, required: true, min: 13, max: 65 },
    targetGender: { type: String, enum: Object.values(TargetGender), required: true },
    budgetAmount: { type: Number, required: true, min: 500, max: 10_000_000 },
    deadline: { type: Date, required: true, index: true },
    contentBrief: { type: String, required: true, minlength: 50, maxlength: 2000 },
    revisionRounds: { type: Number, enum: [1, 2], required: true },
    deliveryType: { type: String, enum: Object.values(CampaignDeliveryType), required: true, index: true },
    shootingLocation: { type: shootingLocationSchema },
    creatorRequirements: { type: creatorRequirementsSchema, default: () => ({}) },
    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.Draft,
      index: true,
    },
    publishedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
    totalBids: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

campaignSchema.index({ status: 1, platform: 1, niche: 1, budgetAmount: 1 });
campaignSchema.index({ "shootingLocation.geo": "2dsphere" }, { sparse: true });

campaignSchema.pre("validate", function (next) {
  if (this.deliveryType === CampaignDeliveryType.Onsite && !this.shootingLocation) {
    this.invalidate("shootingLocation", "Shooting location is required for onsite campaigns");
  }
  next();
});

export const CampaignModel = model<ICampaign>("Campaign", campaignSchema);
