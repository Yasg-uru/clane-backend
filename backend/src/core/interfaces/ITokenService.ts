import type { JwtPayload } from "../types";

export interface ITokenService {
  generateAccessToken(payload: JwtPayload): string;
  generateRefreshToken(payload: JwtPayload): string;
  verifyAccessToken(token: string): JwtPayload;
  verifyRefreshToken(token: string): JwtPayload;
  hashToken(token: string): string;
  blacklistAccessToken(jti: string, expiresInSeconds: number): Promise<void>;
  isBlacklisted(jti: string): Promise<boolean>;
}
