import crypto from "crypto";
import type { RedisClient } from "../../config/RedisClient";
import type { IOAuthStateService, OAuthStatePayload, OAuthIntent } from "../../core/interfaces/IOAuthStateService";
import type { UserRole, SocialProvider } from "../../core/types";
import { AuthError } from "../../core/errors/AuthError";

const STATE_TTL_SECONDS = 600; // 10 minutes
const INSTAGRAM_PROFILE_TTL_SECONDS = 600; // 10 minutes

export class OAuthStateService implements IOAuthStateService {
  constructor(private readonly redisClient: RedisClient) {}

  async generate(
    role: UserRole,
    provider: SocialProvider,
    intent: OAuthIntent,
    userId?: string,
  ): Promise<string> {
    const nonce = crypto.randomBytes(32).toString("hex");
    const state = crypto.randomBytes(32).toString("hex");

    const payload: OAuthStatePayload = { role, provider, intent, nonce, userId };

    await this.redisClient.set(
      this.stateKey(state),
      JSON.stringify(payload),
      STATE_TTL_SECONDS,
    );

    return state;
  }

  async verify(state: string): Promise<OAuthStatePayload> {
    const raw = await this.redisClient.get(this.stateKey(state));

    if (!raw) {
      throw new AuthError("OAuth state expired or invalid", "INVALID_OAUTH_STATE");
    }

    // Consume the state — one-time use
    await this.redisClient.del(this.stateKey(state));

    let payload: OAuthStatePayload;
    try {
      payload = JSON.parse(raw) as OAuthStatePayload;
    } catch {
      throw new AuthError("OAuth state expired or invalid", "INVALID_OAUTH_STATE");
    }

    return payload;
  }

  async storeInstagramProfile(profile: Record<string, unknown>): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString("hex");
    await this.redisClient.set(
      this.instagramProfileKey(sessionId),
      JSON.stringify(profile),
      INSTAGRAM_PROFILE_TTL_SECONDS,
    );
    return sessionId;
  }

  async retrieveInstagramProfile(sessionId: string): Promise<Record<string, unknown> | null> {
    const raw = await this.redisClient.get(this.instagramProfileKey(sessionId));
    if (!raw) return null;

    // Consume the session — one-time use
    await this.redisClient.del(this.instagramProfileKey(sessionId));

    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private stateKey(state: string): string {
    return `oauth:state:${state}`;
  }

  private instagramProfileKey(sessionId: string): string {
    return `oauth:instagram:profile:${sessionId}`;
  }
}
