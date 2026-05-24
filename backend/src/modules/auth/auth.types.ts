import type { SafeUser } from "../../core/types";

export interface AuthResult {
  status?: "authenticated" | "profile_incomplete";
  accessToken: string | null;
  refreshToken: string | null;
  intermediateToken?: string | null;
  user: SafeUser;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}
