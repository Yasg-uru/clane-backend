import type { RequestHandler } from "express";
import { AsyncHandler } from "../../utils/asyncHandler";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import { AuthError } from "../../core/errors/AuthError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  authenticate: RequestHandler = AsyncHandler.wrap(async (req, _res, next) => {
    const token = this.extractBearerToken(req.header("Authorization"));
    const payload = this.tokenService.verifyAccessToken(token);

    if (payload.jti) {
      const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
      if (blacklisted) throw new AuthError("Unauthorized");
    }

    req.user = payload;
    next();
  });

  authenticateIntermediate(
    purpose: "email_verification" | "profile_completion",
  ): RequestHandler {
    return AsyncHandler.wrap(async (req, _res, next) => {
      const token = this.extractBearerToken(req.header("Authorization"));
      const payload = this.tokenService.verifyIntermediateToken(token, purpose);

      if (payload.jti) {
        const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
        if (blacklisted) {
          throw new ForbiddenError("Insufficient token scope", "INSUFFICIENT_TOKEN_SCOPE");
        }
      }

      req.user = payload;
      next();
    });
  }

  authenticateOrIntermediate: RequestHandler = AsyncHandler.wrap(async (req, _res, next) => {
    const token = this.extractBearerToken(req.header("Authorization"));

    try {
      const payload = this.tokenService.verifyAccessToken(token);
      if (payload.jti) {
        const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
        if (blacklisted) throw new AuthError("Unauthorized");
      }
      req.user = payload;
      next();
      return;
    } catch (err) {
      if (!(err instanceof AuthError)) throw err;
    }

    const payload = this.tokenService.verifyIntermediateToken(token, "profile_completion");
    if (payload.jti) {
      const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
      if (blacklisted) {
        throw new ForbiddenError("Insufficient token scope", "INSUFFICIENT_TOKEN_SCOPE");
      }
    }
    req.user = payload;
    next();
  });

  private extractBearerToken(authorization: string | undefined): string {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AuthError("Unauthorized");
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) throw new AuthError("Unauthorized");
    return token;
  }
}
