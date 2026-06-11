import type { CampaignPlatform, CampaignDeliveryType } from "./campaign.types";

// ── Creator browse types — matches GET /api/v1/creators response ─────────────

export const CreatorPlatform = {
  INSTAGRAM: "instagram",
  YOUTUBE: "youtube",
  BOTH: "both",
  NONE: "none",
} as const;
export type CreatorPlatform = (typeof CreatorPlatform)[keyof typeof CreatorPlatform];

export interface CreatorBrowseItem {
  id: string;
  fullName: string;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  city: string;
  platform: CreatorPlatform;
  instagramProfilePicUrl?: string;
  instagramEngagementRate?: number;
  instagramAvgLikes?: number;
  instagramAuthenticityScore?: number;
  instagramAuthenticityRisk?: string;
  youtubeSubscriberCount?: number;
  youtubeEngagementRate?: number;
  youtubeAvgViews?: number;
  youtubeAuthenticityScore?: number;
  youtubeAuthenticityRisk?: string;
  instagramConnected: boolean;
  instagramVerified: boolean;
  youtubeConnected: boolean;
  isProfileComplete: boolean;
  createdAt: string;
}

export interface PaginatedCreators {
  items: CreatorBrowseItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreatorListFilters {
  niche?: string[];
  platform?: Exclude<CreatorPlatform, "none">;
  city?: string;
  followersMin?: number;
  followersMax?: number;
  page?: number;
  limit?: number;
}

export interface CampaignBrowseItem {
  _id: string;
  title: string;
  slug: string;
  platform: CampaignPlatform;
  niche: string[];
  targetLocation: string;
  budgetAmount: number;
  deadline: string;
  contentBrief: string;
  deliveryType: CampaignDeliveryType;
  brandName: string;
  totalBids: number;
  viewCount: number;
  hasBid: boolean;
  publishedAt: string;
  createdAt: string;
}

export interface CampaignBrowseDetail extends CampaignBrowseItem {
  targetAgeMin: number;
  targetAgeMax: number;
  targetGender: string;
  revisionRounds: 1 | 2;
  creatorRequirements: Record<string, unknown>;
  existingBid?: {
    _id: string;
    proposedAmount: number;
    status: string;
  } | null;
}

export interface PaginatedCampaignBrowse {
  items: CampaignBrowseItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CampaignBrowseFilters {
  platform?: CampaignPlatform;
  niche?: string[];
  budgetMin?: number;
  budgetMax?: number;
  deliveryType?: CampaignDeliveryType;
  page?: number;
  limit?: number;
}
