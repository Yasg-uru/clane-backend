import type { AuthenticityRisk } from "../../core/types";

export enum CreatorPlatform {
  Instagram = "instagram",
  YouTube = "youtube",
  Both = "both",
}

export interface CreatorBrowseFilters {
  niche?: string[];
  platform?: CreatorPlatform;
  city?: string;
  followersMin?: number;
  followersMax?: number;
}

export interface CreatorBrowseView {
  id: string;
  fullName: string;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  city: string;
  platform: CreatorPlatform | "none";
  instagramProfilePicUrl?: string;
  instagramEngagementRate?: number;
  instagramAvgLikes?: number;
  instagramAuthenticityScore?: number;
  instagramAuthenticityRisk?: AuthenticityRisk;
  youtubeSubscriberCount?: number;
  youtubeEngagementRate?: number;
  youtubeAvgViews?: number;
  youtubeAuthenticityScore?: number;
  youtubeAuthenticityRisk?: AuthenticityRisk;
  instagramConnected: boolean;
  instagramVerified: boolean;
  youtubeConnected: boolean;
  isProfileComplete: boolean;
  createdAt: Date;
}
