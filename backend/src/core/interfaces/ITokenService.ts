import type { JwtPayload, UserRole } from "../types";

export interface IntermediateTokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  purpose: "email_verification" | "profile_completion";
}

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
  hashToken(token: string): string;
  blacklistAccessToken(jti: string, expiresInSeconds: number): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
  generateIntermediateToken(payload: IntermediateTokenPayload): string;
  verifyIntermediateToken(
    token: string,
    expectedPurpose: "email_verification" | "profile_completion",
  ): JwtPayload;
  signInstagramPendingToken(sessionId: string): string;
  verifyInstagramPendingToken(token: string): { sessionId: string };
}
