import { env } from "../../config/env";
import type { IYoutubeDataService, YoutubeTokens } from "../../core/interfaces/IYoutubeDataService";
import type { YoutubeChannelData } from "../../modules/social-verification/social-verification.types";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError";

interface YtChannelStatistics {
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
  hiddenSubscriberCount?: boolean;
}

interface YtChannelSnippet {
  title?: string;
  description?: string;
  customUrl?: string;
  thumbnails?: { default?: { url?: string } };
}

interface YtChannelItem {
  id?: string;
  snippet?: YtChannelSnippet;
  statistics?: YtChannelStatistics;
}

interface YtChannelListResponse {
  items?: YtChannelItem[];
}

interface YtVideoStatistics {
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
}

interface YtVideoItem {
  statistics?: YtVideoStatistics;
}

interface YtVideoListResponse {
  items?: YtVideoItem[];
}

interface YtSearchResultId {
  videoId?: string;
}

interface YtSearchResult {
  id?: YtSearchResultId;
}

interface YtSearchResponse {
  items?: YtSearchResult[];
}

interface GoogleTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
}

export class YoutubeDataService implements IYoutubeDataService {
  private static readonly YOUTUBE_BASE = "https://www.googleapis.com/youtube/v3";
  private static readonly GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
  private static readonly RECENT_VIDEOS_LIMIT = 20;

  async fetchChannelData(decryptedAccessToken: string): Promise<YoutubeChannelData> {
    const channelItem = await this.fetchChannelStats(decryptedAccessToken);
    const channelId = channelItem.id ?? "";
    const stats = channelItem.statistics ?? {};
    const snippet = channelItem.snippet ?? {};

    const subscriberCount = stats.hiddenSubscriberCount ? 0 : parseInt(stats.subscriberCount ?? "0", 10);
    const videoCount = parseInt(stats.videoCount ?? "0", 10);
    const totalViewCount = parseInt(stats.viewCount ?? "0", 10);

    const videoStats = videoCount > 0
      ? await this.fetchRecentVideoStats(channelId, decryptedAccessToken)
      : { avgViews: 0, avgLikes: 0, avgComments: 0 };

    const engagementRate = videoStats.avgViews > 0
      ? ((videoStats.avgLikes + videoStats.avgComments) / videoStats.avgViews) * 100
      : 0;

    return {
      channelId,
      title: snippet.title ?? "",
      description: snippet.description ?? "",
      customUrl: snippet.customUrl ?? "",
      thumbnailUrl: snippet.thumbnails?.default?.url ?? "",
      subscriberCount,
      videoCount,
      totalViewCount,
      avgViews: videoStats.avgViews,
      avgLikes: videoStats.avgLikes,
      avgComments: videoStats.avgComments,
      engagementRate: Math.round(engagementRate * 100) / 100,
    };
  }

  async refreshAccessToken(decryptedRefreshToken: string): Promise<YoutubeTokens> {
    const body = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: decryptedRefreshToken,
      grant_type: "refresh_token",
    });

    const res = await fetch(YoutubeDataService.GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      throw new ServiceUnavailableError("Failed to refresh YouTube access token", "YOUTUBE_TOKEN_REFRESH_ERROR");
    }

    const data = (await res.json()) as GoogleTokenResponse;

    if (!data.access_token) {
      throw new ServiceUnavailableError("YouTube token refresh returned no access token", "YOUTUBE_TOKEN_REFRESH_ERROR");
    }

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? decryptedRefreshToken,
      expiresAt: new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
    };
  }

  private async fetchChannelStats(accessToken: string): Promise<YtChannelItem> {
    const params = new URLSearchParams({
      part: "snippet,statistics",
      mine: "true",
      access_token: accessToken,
    });

    const res = await fetch(`${YoutubeDataService.YOUTUBE_BASE}/channels?${params.toString()}`);

    if (!res.ok) {
      throw new ServiceUnavailableError("Failed to fetch YouTube channel stats", "YOUTUBE_API_ERROR");
    }

    const data = (await res.json()) as YtChannelListResponse;
    const item = data.items?.[0];

    if (!item) {
      throw new ServiceUnavailableError("No YouTube channel found", "YOUTUBE_API_ERROR");
    }

    return item;
  }

  private async fetchRecentVideoStats(
    channelId: string,
    accessToken: string,
  ): Promise<{ avgViews: number; avgLikes: number; avgComments: number }> {
    const videoIds = await this.fetchRecentVideoIds(channelId, accessToken);
    if (videoIds.length === 0) return { avgViews: 0, avgLikes: 0, avgComments: 0 };

    const params = new URLSearchParams({
      part: "statistics",
      id: videoIds.join(","),
      access_token: accessToken,
    });

    const res = await fetch(`${YoutubeDataService.YOUTUBE_BASE}/videos?${params.toString()}`);
    if (!res.ok) return { avgViews: 0, avgLikes: 0, avgComments: 0 };

    const data = (await res.json()) as YtVideoListResponse;
    const items = data.items ?? [];

    if (items.length === 0) return { avgViews: 0, avgLikes: 0, avgComments: 0 };

    const totals = items.reduce(
      (acc, item) => {
        acc.views += parseInt(item.statistics?.viewCount ?? "0", 10);
        acc.likes += parseInt(item.statistics?.likeCount ?? "0", 10);
        acc.comments += parseInt(item.statistics?.commentCount ?? "0", 10);
        return acc;
      },
      { views: 0, likes: 0, comments: 0 },
    );

    return {
      avgViews: Math.round(totals.views / items.length),
      avgLikes: Math.round(totals.likes / items.length),
      avgComments: Math.round(totals.comments / items.length),
    };
  }

  private async fetchRecentVideoIds(channelId: string, accessToken: string): Promise<string[]> {
    const params = new URLSearchParams({
      part: "id",
      channelId,
      type: "video",
      order: "date",
      maxResults: String(YoutubeDataService.RECENT_VIDEOS_LIMIT),
      access_token: accessToken,
    });

    const res = await fetch(`${YoutubeDataService.YOUTUBE_BASE}/search?${params.toString()}`);
    if (!res.ok) return [];

    const data = (await res.json()) as YtSearchResponse;
    return (data.items ?? [])
      .map((item) => item.id?.videoId)
      .filter((id): id is string => typeof id === "string");
  }
}
