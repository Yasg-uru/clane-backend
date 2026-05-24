import crypto from "crypto";
import jwt, { type JwtPayload as JsonWebTokenPayload } from "jsonwebtoken";
import { env } from "../../config/env";
import type { RedisClient } from "../../config/RedisClient";
import type { IntermediateTokenPayload, ITokenService } from "../../core/interfaces/ITokenService";
import { AuthError } from "../../core/errors/AuthError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import type { JwtPayload, UserRole } from "../../core/types";
import {
  ACCESS_TOKEN_OPTIONS,
  INSTAGRAM_PENDING_PURPOSE,
  INTERMEDIATE_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
  SHORT_LIVED_TOKEN_OPTIONS,
  VERIFY_OPTIONS,
} from "./token.constants";

export class TokenService implements ITokenService {
  constructor(private readonly redisClient: RedisClient) {}

  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
        jti: crypto.randomUUID(),
      },
      env.JWT_ACCESS_SECRET,
      ACCESS_TOKEN_OPTIONS,
    );
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      { userId: payload.userId, role: payload.role, email: payload.email },
      env.JWT_REFRESH_SECRET,
      REFRESH_TOKEN_OPTIONS,
    );
  }

  generateIntermediateToken(payload: IntermediateTokenPayload): string {
    return jwt.sign(
      {
        userId: payload.userId,
        role: payload.role,
        email: payload.email,
        jti: crypto.randomUUID(),
        purpose: payload.purpose,
      },
      env.JWT_ACCESS_SECRET,
      INTERMEDIATE_TOKEN_OPTIONS,
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, VERIFY_OPTIONS);
    if (typeof decoded === "object" && decoded !== null && "purpose" in decoded) {
      throw new AuthError("Unauthorized");
    }
    return this.normalizePayload(decoded);
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.normalizePayload(jwt.verify(token, env.JWT_REFRESH_SECRET, VERIFY_OPTIONS));
  }

  verifyIntermediateToken(
    token: string,
    expectedPurpose: "email_verification" | "profile_completion",
  ): JwtPayload {
    let decoded: string | JsonWebTokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, VERIFY_OPTIONS);
    } catch {
      throw new ForbiddenError("Insufficient token scope", "INSUFFICIENT_TOKEN_SCOPE");
    }

    if (typeof decoded === "string" || decoded === null) {
      throw new ForbiddenError("Insufficient token scope", "INSUFFICIENT_TOKEN_SCOPE");
    }

    if (
      !("purpose" in decoded) ||
      (decoded as Record<string, unknown>).purpose !== expectedPurpose
    ) {
      throw new ForbiddenError("Insufficient token scope", "INSUFFICIENT_TOKEN_SCOPE");
    }

    return this.normalizePayload(decoded);
  }

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  async blacklistAccessToken(jti: string, expiresInSeconds: number): Promise<void> {
    await this.redisClient.set(`blacklist:at:${jti}`, "1", expiresInSeconds);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    return (await this.redisClient.exists(`blacklist:at:${jti}`)) === 1;
  }

  signInstagramPendingToken(sessionId: string): string {
    return jwt.sign(
      { sessionId, purpose: INSTAGRAM_PENDING_PURPOSE },
      env.JWT_ACCESS_SECRET,
      SHORT_LIVED_TOKEN_OPTIONS,
    );
  }

  verifyInstagramPendingToken(token: string): { sessionId: string } {
    let decoded: string | JsonWebTokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, VERIFY_OPTIONS);
    } catch {
      throw new AuthError("Unauthorized");
    }

    if (typeof decoded === "string" || decoded === null) {
      throw new AuthError("Unauthorized");
    }

    const { sessionId, purpose } = decoded as Record<string, unknown>;

    if (purpose !== INSTAGRAM_PENDING_PURPOSE || typeof sessionId !== "string") {
      throw new AuthError("Unauthorized");
    }

    return { sessionId };
  }

  private normalizePayload(decoded: string | JsonWebTokenPayload): JwtPayload {
    if (typeof decoded === "string") throw new AuthError("Unauthorized");

    const { userId, role, email, jti, exp, purpose } = decoded;

    if (typeof userId !== "string" || !TokenService.isUserRole(role) || typeof email !== "string") {
      throw new AuthError("Unauthorized");
    }

    return {
      userId,
      role,
      email,
      jti: typeof jti === "string" ? jti : undefined,
      exp: typeof exp === "number" ? exp : undefined,
      purpose:
        purpose === "email_verification" || purpose === "profile_completion"
          ? purpose
          : undefined,
    };
  }

  private static isUserRole(role: unknown): role is UserRole {
    return role === "brand" || role === "creator";
  }
}
