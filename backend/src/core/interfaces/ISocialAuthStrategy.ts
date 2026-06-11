import type { SocialProfile } from "../types";

export interface ISocialAuthStrategy {
  readonly strategyName: string;
  getAuthUrl(redirectUri: string, state: string): string;
  exchange(code: string, redirectUri: string): Promise<SocialProfile>;
}
