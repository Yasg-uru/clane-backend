import type { SafeUser, SocialAuthStatus } from "../../core/types";

export interface AuthResult {
  status?: SocialAuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  intermediateToken?: string | null;
  user: SafeUser;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}
