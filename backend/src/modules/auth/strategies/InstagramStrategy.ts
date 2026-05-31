import { env } from "../../../config/env";
import type { ISocialAuthStrategy } from "../../../core/interfaces/ISocialAuthStrategy";
import { SocialProvider } from "../../../core/types";
import type { SocialProfile } from "../../../core/types";
import { AuthError } from "../../../core/errors/AuthError";
import { ServiceUnavailableError } from "../../../core/errors/ServiceUnavailableError";

interface InstagramTokenResponse {
  access_token: string;
  token_type: string;
}

interface InstagramUserResponse {
  id: string;
  username: string;
  name?: string;
  biography?: string;
  followers_count?: number;
  profile_picture_url?: string;
  email?: string;
}

interface InstagramLongLivedTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class InstagramStrategy implements ISocialAuthStrategy {
  readonly strategyName = "instagram";

  private static readonly API_VERSION = "v21.0";
  private static readonly AUTH_BASE = "https://api.instagram.com/oauth";
  private static readonly GRAPH_BASE = "https://graph.instagram.com";
  private static readonly TOKEN_EXCHANGE_URL = `https://graph.instagram.com/${InstagramStrategy.API_VERSION}/oauth/access_token`;
  private static readonly LONG_LIVED_TOKEN_URL = `${InstagramStrategy.GRAPH_BASE}/access_token`;

  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: env.INSTAGRAM_APP_ID,
      redirect_uri: redirectUri,
      scope: "instagram_business_basic",
      response_type: "code",
      state,
    });
    return `${InstagramStrategy.AUTH_BASE}/authorize?${params.toString()}`;
  }

  async exchange(code: string, redirectUri: string): Promise<SocialProfile> {
    const shortLivedToken = await this.exchangeCodeForShortLivedToken(code, redirectUri);
    const longLivedData = await this.exchangeForLongLivedToken(shortLivedToken);
    const userInfo = await this.fetchUserProfile(longLivedData.access_token);

    const expiresAt = new Date(Date.now() + longLivedData.expires_in * 1000);

    return {
      provider: SocialProvider.Instagram,
      providerId: userInfo.id,
      email: userInfo.email ?? null,
      fullName: userInfo.name ?? userInfo.username ?? "",
      profilePhotoUrl: userInfo.profile_picture_url ?? null,
      instagramHandle: userInfo.username ?? null,
      instagramFollowers: userInfo.followers_count ?? null,
      instagramBio: userInfo.biography ?? null,
      instagramAccessToken: longLivedData.access_token,
      instagramTokenExpiresAt: expiresAt,
      youtubeChannelId: null,
      youtubeAccessToken: null,
      youtubeRefreshToken: null,
      youtubeTokenExpiresAt: null,
      rawProfile: userInfo as unknown as Record<string, unknown>,
    };
  }

  private async exchangeCodeForShortLivedToken(
    code: string,
    redirectUri: string,
  ): Promise<string> {
    const body = new URLSearchParams({
      client_id: env.INSTAGRAM_APP_ID,
      client_secret: env.INSTAGRAM_APP_SECRET,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(InstagramStrategy.TOKEN_EXCHANGE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 400) {
        throw new AuthError("OAuth code expired or invalid", "OAUTH_CODE_EXPIRED");
      }
      throw new ServiceUnavailableError(
        `Instagram token exchange failed: ${text}`,
        "SOCIAL_PROVIDER_ERROR",
      );
    }

    const data = (await res.json()) as InstagramTokenResponse;
    return data.access_token;
  }

  private async exchangeForLongLivedToken(
    shortLivedToken: string,
  ): Promise<InstagramLongLivedTokenResponse> {
    const params = new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: env.INSTAGRAM_APP_SECRET,
      access_token: shortLivedToken,
    });

    const res = await fetch(
      `${InstagramStrategy.LONG_LIVED_TOKEN_URL}?${params.toString()}`,
    );

    if (!res.ok) {
      throw new ServiceUnavailableError(
        "Instagram long-lived token exchange failed",
        "SOCIAL_PROVIDER_ERROR",
      );
    }

    return res.json() as Promise<InstagramLongLivedTokenResponse>;
  }

  private async fetchUserProfile(accessToken: string): Promise<InstagramUserResponse> {
    const fields = "id,username,name,biography,followers_count,profile_picture_url,email";
    const params = new URLSearchParams({ fields, access_token: accessToken });

    const res = await fetch(`${InstagramStrategy.GRAPH_BASE}/me?${params.toString()}`);

    if (!res.ok) {
      throw new ServiceUnavailableError(
        "Failed to fetch Instagram profile",
        "SOCIAL_PROVIDER_ERROR",
      );
    }

    return res.json() as Promise<InstagramUserResponse>;
  }
}
