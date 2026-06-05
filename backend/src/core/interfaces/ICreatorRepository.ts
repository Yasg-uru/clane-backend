import type { Creator, CreatorDocument, AuthenticityRisk } from "../../models/Creator.model";
import type { IAuthRepository } from "./IRepository";
import type { PaginatedResult } from "../types";
import type { CreatorBrowseFilters } from "../../modules/creator/creator.types";

export interface InstagramPlatformData {
  instagramFollowers?: number;
  instagramPostCount: number;
  instagramAvgLikes: number;
  instagramAvgComments: number;
  instagramEngagementRate: number;
  instagramDataFetchedAt: Date;
  instagramDataLastRefreshedAt: Date;
}

export interface YoutubePlatformData {
  youtubeSubscriberCount: number;
  youtubeVideoCount: number;
  youtubeTotalViewCount: number;
  youtubeAvgViews: number;
  youtubeAvgLikes: number;
  youtubeAvgComments: number;
  youtubeEngagementRate: number;
  youtubeDataFetchedAt: Date;
  youtubeDataLastRefreshedAt: Date;
}

export interface YoutubeTokenData {
  youtubeAccessToken: string;
  youtubeRefreshToken: string;
  youtubeTokenExpiresAt: Date;
}

export interface ICreatorRepository extends IAuthRepository<CreatorDocument, Creator> {
  findByIdWithInstagramToken(id: string): Promise<CreatorDocument | null>;
  findByIdWithYoutubeTokens(id: string): Promise<CreatorDocument | null>;
  findByGoogleId(googleId: string): Promise<CreatorDocument | null>;
  findByInstagramId(instagramId: string): Promise<CreatorDocument | null>;
  findByYoutubeChannelId(channelId: string): Promise<CreatorDocument | null>;
  linkSocialProvider(userId: string, data: Partial<Creator>): Promise<void>;
  markProfileComplete(userId: string): Promise<void>;
  updateInstagramPlatformData(creatorId: string, data: InstagramPlatformData): Promise<void>;
  updateYoutubePlatformData(creatorId: string, data: YoutubePlatformData): Promise<void>;
  updateYoutubeTokens(creatorId: string, data: YoutubeTokenData): Promise<void>;
  updateInstagramAuthenticityScore(creatorId: string, score: number, risk: AuthenticityRisk): Promise<void>;
  updateYoutubeAuthenticityScore(creatorId: string, score: number, risk: AuthenticityRisk): Promise<void>;
  findCreatorsForInstagramRefresh(): Promise<CreatorDocument[]>;
  findCreatorsForYoutubeRefresh(): Promise<CreatorDocument[]>;
  findAllActive(): Promise<CreatorDocument[]>;
  findByIds(ids: string[]): Promise<CreatorDocument[]>;
  findWithBrowseFilters(filters: CreatorBrowseFilters, page: number, limit: number): Promise<PaginatedResult<CreatorDocument>>;
}
