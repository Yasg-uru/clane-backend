import type { UserRole, SocialProvider } from "../types";

export type { SocialProvider };

export type OAuthIntent = "login" | "connect";

export interface OAuthStatePayload {
  role: UserRole;
  provider: SocialProvider;
  intent: OAuthIntent;
  nonce: string;
  userId?: string;
}

export interface IOAuthStateService {
  generate(
    role: UserRole,
    provider: SocialProvider,
    intent: OAuthIntent,
    userId?: string,
  ): Promise<string>;
  verify(state: string): Promise<OAuthStatePayload>;
  storeInstagramProfile(profile: Record<string, unknown>): Promise<string>;
  retrieveInstagramProfile(sessionId: string): Promise<Record<string, unknown> | null>;
}
