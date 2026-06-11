import type { JwtPayload } from "../types";

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  generateIntermediateToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
  verifyIntermediateToken(token: string): JwtPayload;
  signInstagramPendingToken(sessionId: string): string;
  verifyInstagramPendingToken(token: string): { sessionId: string };
  hashToken(token: string): string;
  blacklistAccessToken(jti: string, expiresInSeconds: number): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
}
