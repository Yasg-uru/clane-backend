import type { RequestHandler } from "express";
import { AsyncHandler } from "../../utils/asyncHandler";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import { AuthError } from "../../core/errors/AuthError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import type { UserRole } from "../../core/types";

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  authenticate: RequestHandler = AsyncHandler.wrap(async (req, _res, next) => {
    const authorization = req.header("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AuthError("Unauthorized");
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw new AuthError("Unauthorized");
    }

    const payload = this.tokenService.verifyAccessToken(token);

    if (payload.jti) {
      const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
      if (blacklisted) throw new AuthError("Unauthorized");
    }

    req.user = payload;
    next();
  });

  requireRole(role: UserRole): RequestHandler {
    return AsyncHandler.wrap(async (req, _res, next) => {
      if (!req.user) throw new AuthError("Unauthorized");
      if (req.user.role !== role) throw new ForbiddenError("Insufficient permissions");
      next();
    });
  }
}
