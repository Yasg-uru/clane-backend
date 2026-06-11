import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env";
import type { ISocialAuthStrategy } from "../../../core/interfaces/ISocialAuthStrategy";
import { SocialProvider } from "../../../core/types";
import type { SocialProfile } from "../../../core/types";
import { AuthError } from "../../../core/errors/AuthError";
import { ServiceUnavailableError } from "../../../core/errors/ServiceUnavailableError";

interface YoutubeChannelSnippet {
  title?: string;
  description?: string;
  customUrl?: string;
  thumbnails?: { default?: { url?: string } };
}

interface YoutubeChannelItem {
  id?: string;
  snippet?: YoutubeChannelSnippet;
}

interface YoutubeChannelListResponse {
  items?: YoutubeChannelItem[];
}

export class YoutubeStrategy implements ISocialAuthStrategy {
  readonly strategyName = "youtube";

  private static readonly AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
  private static readonly CHANNELS_API = "https://www.googleapis.com/youtube/v3/channels";
  private static readonly YOUTUBE_SCOPE = "https://www.googleapis.com/auth/youtube.readonly";

  private readonly oauthClient: OAuth2Client;

  constructor() {
    this.oauthClient = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    });
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: YoutubeStrategy.YOUTUBE_SCOPE,
      access_type: "offline",
      prompt: "consent",
      state,
    });
    return `${YoutubeStrategy.AUTH_URL}?${params.toString()}`;
  }

  async exchange(code: string, redirectUri: string): Promise<SocialProfile> {
    let tokens: {
      access_token?: string | null;
      refresh_token?: string | null;
      expiry_date?: number | null;
    };

    try {
      const response = await this.oauthClient.getToken({ code, redirect_uri: redirectUri });
      tokens = response.tokens;
    } catch {
      throw new AuthError("OAuth code expired or invalid", "OAUTH_CODE_EXPIRED");
    }

    if (!tokens.access_token) {
      throw new ServiceUnavailableError("YouTube did not return an access token", "SOCIAL_PROVIDER_ERROR");
    }

    const channel = await this.fetchChannel(tokens.access_token);

    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000);

    return {
      provider: SocialProvider.Youtube,
      providerId: channel.id,
      email: null,
      fullName: channel.title,
      profilePhotoUrl: channel.thumbnailUrl,
      instagramHandle: null,
      instagramFollowers: null,
      instagramBio: null,
      instagramAccessToken: null,
      instagramTokenExpiresAt: null,
      youtubeChannelId: channel.id,
      youtubeAccessToken: tokens.access_token,
      youtubeRefreshToken: tokens.refresh_token ?? null,
      youtubeTokenExpiresAt: expiresAt,
      rawProfile: channel as unknown as Record<string, unknown>,
    };
  }

  private async fetchChannel(accessToken: string): Promise<{ id: string; title: string; thumbnailUrl: string }> {
    const params = new URLSearchParams({
      part: "snippet",
      mine: "true",
      access_token: accessToken,
    });

    const res = await fetch(`${YoutubeStrategy.CHANNELS_API}?${params.toString()}`);

    if (!res.ok) {
      throw new ServiceUnavailableError(
        "Failed to fetch YouTube channel",
        "SOCIAL_PROVIDER_ERROR",
      );
    }

    const data = (await res.json()) as YoutubeChannelListResponse;
    const item = data.items?.[0];

    if (!item?.id) {
      throw new AuthError(
        "No YouTube channel found for this Google account",
        "YOUTUBE_NO_CHANNEL",
      );
    }

    return {
      id: item.id,
      title: item.snippet?.title ?? "",
      thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? "",
    };
  }
}
