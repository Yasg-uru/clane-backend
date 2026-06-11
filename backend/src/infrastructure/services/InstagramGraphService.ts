import type { IInstagramGraphService } from "../../core/interfaces/IInstagramGraphService";
import type { InstagramRichProfile, InstagramMediaItem } from "../../modules/social-verification/social-verification.types";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError";

interface IgUserResponse {
  id?: string;
  username?: string;
  biography?: string;
  profile_picture_url?: string;
  followers_count?: number;
  following_count?: number;
  media_count?: number;
}

interface IgMediaResponse {
  data?: Array<{ like_count?: number; comments_count?: number }>;
}

export class InstagramGraphService implements IInstagramGraphService {
  private static readonly GRAPH_BASE = "https://graph.instagram.com";
  private static readonly MEDIA_FETCH_LIMIT = 30;

  async fetchRichProfile(decryptedAccessToken: string): Promise<InstagramRichProfile> {
    const [userInfo, mediaItems] = await Promise.all([
      this.fetchUserInfo(decryptedAccessToken),
      this.fetchRecentMedia(decryptedAccessToken),
    ]);

    const followersCount = userInfo.followers_count ?? 0;
    const { avgLikes, avgComments } = this.computeMediaAverages(mediaItems);
    const engagementRate =
      followersCount > 0 ? ((avgLikes + avgComments) / followersCount) * 100 : 0;

    return {
      instagramId: userInfo.id ?? "",
      handle: userInfo.username ?? "",
      bio: userInfo.biography ?? "",
      profilePicUrl: userInfo.profile_picture_url ?? "",
      followersCount,
      followingCount: userInfo.following_count ?? 0,
      mediaCount: userInfo.media_count ?? 0,
      avgLikes,
      avgComments,
      engagementRate: Math.round(engagementRate * 100) / 100,
    };
  }

  private async fetchUserInfo(accessToken: string): Promise<IgUserResponse> {
    const fields = "id,username,biography,profile_picture_url,followers_count,following_count,media_count";
    const params = new URLSearchParams({ fields, access_token: accessToken });
    const res = await fetch(`${InstagramGraphService.GRAPH_BASE}/me?${params.toString()}`);

    if (!res.ok) {
      throw new ServiceUnavailableError("Failed to fetch Instagram profile", "INSTAGRAM_API_ERROR");
    }

    return res.json() as Promise<IgUserResponse>;
  }

  private async fetchRecentMedia(accessToken: string): Promise<InstagramMediaItem[]> {
    const fields = "like_count,comments_count";
    const params = new URLSearchParams({
      fields,
      limit: String(InstagramGraphService.MEDIA_FETCH_LIMIT),
      access_token: accessToken,
    });
    const res = await fetch(`${InstagramGraphService.GRAPH_BASE}/me/media?${params.toString()}`);

    if (!res.ok) {
      return [];
    }

    const data = (await res.json()) as IgMediaResponse;
    return (data.data ?? []).map((item) => ({
      likeCount: item.like_count ?? 0,
      commentsCount: item.comments_count ?? 0,
    }));
  }

  private computeMediaAverages(items: InstagramMediaItem[]): { avgLikes: number; avgComments: number } {
    if (items.length === 0) return { avgLikes: 0, avgComments: 0 };
    const totalLikes = items.reduce((sum, item) => sum + item.likeCount, 0);
    const totalComments = items.reduce((sum, item) => sum + item.commentsCount, 0);
    return {
      avgLikes: Math.round(totalLikes / items.length),
      avgComments: Math.round(totalComments / items.length),
    };
  }
}
