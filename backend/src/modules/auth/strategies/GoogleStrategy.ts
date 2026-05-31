import { OAuth2Client } from "google-auth-library";
import { env } from "../../../config/env";
import type { ISocialAuthStrategy } from "../../../core/interfaces/ISocialAuthStrategy";
import { SocialProvider } from "../../../core/types";
import type { SocialProfile } from "../../../core/types";
import { AuthError } from "../../../core/errors/AuthError";
import { ServiceUnavailableError } from "../../../core/errors/ServiceUnavailableError";

export class GoogleStrategy implements ISocialAuthStrategy {
  readonly strategyName = "google";

  private readonly client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    });
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchange(code: string, redirectUri: string): Promise<SocialProfile> {
    let tokens: { id_token?: string | null; access_token?: string | null };

    try {
      const response = await this.client.getToken({ code, redirect_uri: redirectUri });
      tokens = response.tokens;
    } catch {
      throw new AuthError("OAuth code expired or invalid", "OAUTH_CODE_EXPIRED");
    }

    if (!tokens.id_token) {
      throw new ServiceUnavailableError("Google did not return an ID token", "SOCIAL_PROVIDER_ERROR");
    }

    let userInfo: {
      sub?: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    try {
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      userInfo = ticket.getPayload() ?? {};
    } catch {
      throw new ServiceUnavailableError("Failed to verify Google token", "SOCIAL_PROVIDER_ERROR");
    }

    if (!userInfo.sub) {
      throw new ServiceUnavailableError("Google profile missing user ID", "SOCIAL_PROVIDER_ERROR");
    }

    return {
      provider: SocialProvider.Google,
      providerId: userInfo.sub,
      email: userInfo.email ?? null,
      fullName: userInfo.name ?? "",
      profilePhotoUrl: userInfo.picture ?? null,
      instagramHandle: null,
      instagramFollowers: null,
      instagramBio: null,
      instagramAccessToken: null,
      instagramTokenExpiresAt: null,
      youtubeChannelId: null,
      youtubeAccessToken: null,
      youtubeRefreshToken: null,
      youtubeTokenExpiresAt: null,
      rawProfile: userInfo as Record<string, unknown>,
    };
  }
}
