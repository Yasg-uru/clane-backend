// ── Campaign enums — values must match backend exactly ──────────────────────

export const CampaignStatus = {
  DRAFT: "draft",
  ACTIVE: "active",
  CLOSED: "closed",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;
export type CampaignStatus = (typeof CampaignStatus)[keyof typeof CampaignStatus];

export const CampaignPlatform = {
  INSTAGRAM: "instagram",
  YOUTUBE: "youtube",
  BOTH: "both",
} as const;
export type CampaignPlatform = (typeof CampaignPlatform)[keyof typeof CampaignPlatform];

export const TargetGender = {
  MALE: "male",
  FEMALE: "female",
  ANY: "any",
} as const;
export type TargetGender = (typeof TargetGender)[keyof typeof TargetGender];

export const CampaignDeliveryType = {
  ONSITE: "onsite",
  REMOTE: "remote",
} as const;
export type CampaignDeliveryType =
  (typeof CampaignDeliveryType)[keyof typeof CampaignDeliveryType];

// ── API shapes ───────────────────────────────────────────────────────────────

export interface ShootingLocation {
  geo: { type: "Point"; coordinates: [number, number] };
  radiusKm?: number;
}

export interface InstagramRequirements {
  minFollowers?: number;
  maxFollowers?: number;
  minAvgReelViews?: number;
  minAvgPostLikes?: number;
  minEngagementRate?: number;
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

export interface Campaign {
  _id: string;
  brandId: string;
  title: string;
  slug: string;
  platform: CampaignPlatform;
  niche: string[];
  targetLocation: string;
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: TargetGender;
  budgetAmount: number;
  deadline: string;
  contentBrief: string;
  revisionRounds: 1 | 2;
  deliveryType: CampaignDeliveryType;
  shootingLocation?: ShootingLocation;
  creatorRequirements: CreatorRequirements;
  status: CampaignStatus;
  publishedAt: string | null;
  closedAt: string | null;
  totalBids: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCampaigns {
  items: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BrandCampaignFilters {
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

// ── Wizard step data ─────────────────────────────────────────────────────────

export interface CampaignWizardData {
  // Step 1 — Basics
  title: string;
  platform: CampaignPlatform;
  niche: string[];
  targetLocation: string;

  // Step 2 — Audience
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: TargetGender;
  creatorRequirements: CreatorRequirements;

  // Step 3 — Budget & Timeline
  budgetAmount: number;
  deadline: string; // "YYYY-MM-DD" from date input
  deliveryType: CampaignDeliveryType;
  shootingLat: string;
  shootingLng: string;
  shootingRadiusKm: string;

  // Step 4 — Content
  contentBrief: string;
  revisionRounds: 1 | 2;
}
