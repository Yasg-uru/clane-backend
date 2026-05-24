import crypto from "crypto";
import jwt, {
  type JwtPayload as JsonWebTokenPayload,
  type SignOptions,
  type VerifyOptions,
} from "jsonwebtoken";
import { env } from "../../config/env";
import type { RedisClient } from "../../config/RedisClient";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import { AuthError } from "../../core/errors/AuthError";
import type { JwtPayload, UserRole } from "../../core/types";

const JWT_ISSUER = "creatorlane";
const JWT_AUDIENCE = "creatorlane-users";
const INSTAGRAM_PENDING_PURPOSE = "instagram_email_submission" as const;

const accessTokenOptions: SignOptions = {
  expiresIn: "15m",
  algorithm: "HS256",
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

const refreshTokenOptions: SignOptions = {
  expiresIn: "7d",
  algorithm: "HS256",
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

const shortLivedOptions: SignOptions = {
  expiresIn: "10m",
  algorithm: "HS256",
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

const verifyOptions: VerifyOptions = {
  algorithms: ["HS256"],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

const isUserRole = (role: unknown): role is UserRole =>
  role === "brand" || role === "creator";

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
      accessTokenOptions,
    );
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(
      { userId: payload.userId, role: payload.role, email: payload.email },
      env.JWT_REFRESH_SECRET,
      refreshTokenOptions,
    );
  }

  verifyAccessToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, verifyOptions);
    if (typeof decoded === "object" && decoded !== null && "purpose" in decoded) {
      throw new AuthError("Unauthorized");
    }
    return this.normalizePayload(decoded);
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.normalizePayload(jwt.verify(token, env.JWT_REFRESH_SECRET, verifyOptions));
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
      shortLivedOptions,
    );
  }

  verifyInstagramPendingToken(token: string): { sessionId: string } {
    let decoded: string | JsonWebTokenPayload;
    try {
      decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, verifyOptions);
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

    const { userId, role, email, jti, exp } = decoded;

    if (typeof userId !== "string" || !isUserRole(role) || typeof email !== "string") {
      throw new AuthError("Unauthorized");
    }

    return {
      userId,
      role,
      email,
      jti: typeof jti === "string" ? jti : undefined,
      exp: typeof exp === "number" ? exp : undefined,
    };
  }
}
