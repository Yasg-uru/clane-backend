import type { AuthenticityRisk } from "../../core/types";

export interface InstagramMediaItem {
  likeCount: number;
  commentsCount: number;
}

export interface InstagramRichProfile {
  instagramId: string;
  handle: string;
  bio: string;
  profilePicUrl: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}

export interface YoutubeChannelData {
  channelId: string;
  title: string;
  description: string;
  customUrl: string;
  thumbnailUrl: string;
  subscriberCount: number;
  videoCount: number;
  totalViewCount: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}

export interface AuthenticityScoreBreakdown {
  engagementScore: number;
  audienceQualityScore: number;
  activityScore: number;
}

export interface AuthenticityResult {
  score: number;
  risk: AuthenticityRisk;
  breakdown: AuthenticityScoreBreakdown;
}

export interface InstagramAuthenticityMetrics {
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}

export interface YoutubeAuthenticityMetrics {
  subscriberCount: number;
  videoCount: number;
  totalViewCount: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}

export interface InstagramDataReadyPayload {
  creatorId: string;
  followersCount: number;
  followingCount: number;
  mediaCount: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}

export interface YoutubeDataReadyPayload {
  creatorId: string;
  subscriberCount: number;
  videoCount: number;
  totalViewCount: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
}
