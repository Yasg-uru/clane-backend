import crypto from "crypto";
import type { RedisClient } from "../../config/RedisClient";
import type { IOAuthStateService, OAuthIntent, OAuthStatePayload, SocialProvider } from "../../core/interfaces/IOAuthStateService";
import { AuthError } from "../../core/errors/AuthError";
import type { UserRole } from "../../core/types";
import { INSTAGRAM_SESSION_TTL_SECONDS, OAUTH_STATE_TTL_SECONDS } from "./oauth-state.constants";

export class OAuthStateService implements IOAuthStateService {
  constructor(private readonly redisClient: RedisClient) {}

  async generate(
    role: UserRole,
    provider: SocialProvider,
    intent: OAuthIntent,
    userId?: string,
  ): Promise<string> {
    const nonce = crypto.randomBytes(32).toString("hex");
    const payload: OAuthStatePayload = {
      role,
      provider,
      intent,
      nonce,
      ...(userId !== undefined ? { userId } : {}),
    };
    const state = Buffer.from(JSON.stringify(payload)).toString("base64");
    await this.redisClient.set(this.stateKey(nonce), state, OAUTH_STATE_TTL_SECONDS);
    return state;
  }

  async verify(state: string): Promise<OAuthStatePayload> {
    let payload: OAuthStatePayload;

    try {
      const decoded = Buffer.from(state, "base64").toString("utf8");
      payload = JSON.parse(decoded) as OAuthStatePayload;
    } catch {
      throw new AuthError("Invalid OAuth state", "INVALID_OAUTH_STATE");
    }

    const { nonce } = payload;
    if (typeof nonce !== "string" || !nonce) {
      throw new AuthError("Invalid OAuth state", "INVALID_OAUTH_STATE");
    }

    const stored = await this.redisClient.get(this.stateKey(nonce));
    if (!stored || stored !== state) {
      throw new AuthError("Invalid OAuth state", "INVALID_OAUTH_STATE");
    }

    await this.redisClient.del(this.stateKey(nonce));
    return payload;
  }

  async storeInstagramProfile(profile: Record<string, unknown>): Promise<string> {
    const sessionId = crypto.randomUUID();
    await this.redisClient.set(
      this.instagramSessionKey(sessionId),
      JSON.stringify(profile),
      INSTAGRAM_SESSION_TTL_SECONDS,
    );
    return sessionId;
  }

  async retrieveInstagramProfile(sessionId: string): Promise<Record<string, unknown> | null> {
    const data = await this.redisClient.get(this.instagramSessionKey(sessionId));
    if (!data) return null;
    await this.redisClient.del(this.instagramSessionKey(sessionId));
    return JSON.parse(data) as Record<string, unknown>;
  }

  private stateKey(nonce: string): string {
    return `oauth:state:${nonce}`;
  }

  private instagramSessionKey(sessionId: string): string {
    return `oauth:instagram:session:${sessionId}`;
  }
}
