import type { SafeUser } from "../../core/types";

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: SafeUser;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}
