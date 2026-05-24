import type { RequestHandler } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import { AuthError } from "../../core/errors/AuthError";

export class AuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
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
}
