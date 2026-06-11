import type { RequestHandler } from "express";
import { AuthError } from "../../core/errors/AuthError";
import { ValidationError } from "../../core/errors/ValidationError";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import { UserRole, SocialProvider } from "../../core/types";
import { AsyncHandler } from "../../utils/asyncHandler";

export class SocialAuthMiddleware {
  constructor(private readonly tokenService: ITokenService) {}

  validateSocialParams: RequestHandler = (req, _res, next) => {
    const role = req.params["role"] as string | undefined;
    const provider = req.params["provider"] as string | undefined;

    const validRoles = Object.values(UserRole) as string[];
    if (!role || !validRoles.includes(role)) {
      throw new ValidationError("Invalid role parameter", "INVALID_ROUTE_PARAMS");
    }

    const validProviders = Object.values(SocialProvider) as string[];
    if (provider !== undefined && !validProviders.includes(provider)) {
      throw new ValidationError("Invalid provider parameter", "INVALID_ROUTE_PARAMS");
    }

    if (provider === SocialProvider.Youtube && role === UserRole.Brand) {
      throw new ValidationError("YouTube is not available for brands", "INVALID_ROUTE_PARAMS");
    }

    next();
  };

  oauthSessionAuth: RequestHandler = AsyncHandler.wrap(async (req, _res, next) => {
    const authorization = req.header("Authorization");
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new AuthError("Unauthorized");
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) throw new AuthError("Unauthorized");
    const { sessionId } = this.tokenService.verifyInstagramPendingToken(token);
    req.oauthSession = { sessionId };
    next();
  });
}
