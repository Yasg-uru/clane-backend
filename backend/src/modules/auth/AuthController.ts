import type { Request, RequestHandler } from "express";
import { AuthError } from "../../core/errors/AuthError";
import { ValidationError } from "../../core/errors/ValidationError";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { SocialProvider, UserRole } from "../../core/types";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import {
  brandCompleteProfileSchema,
  brandRegisterSchema,
  creatorCompleteProfileSchema,
  creatorRegisterSchema,
  loginSchema,
  resendOtpSchema,
  socialCallbackSchema,
  submitInstagramEmailSchema,
  verifyOtpSchema,
} from "./auth.validator";
import type { BrandAuthService } from "./BrandAuthService";
import type { CreatorAuthService } from "./CreatorAuthService";
import type { BaseAuthService } from "./BaseAuthService";
import {
  CLEAR_REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_TOKEN_COOKIE,
} from "./auth.constants";

export class AuthController {
  constructor(
    private readonly brandAuthService: BrandAuthService,
    private readonly creatorAuthService: CreatorAuthService,
    private readonly tokenService: ITokenService,
  ) {}

  registerBrand = AsyncHandler.wrap(async (req, res) => {
    const payload = brandRegisterSchema.parse(req.body);
    await this.brandAuthService.register(payload);
    res.status(201).json(new ApiResponse("OTP sent to email", { email: payload.email }));
  });

  registerCreator = AsyncHandler.wrap(async (req, res) => {
    const payload = creatorRegisterSchema.parse(req.body);
    await this.creatorAuthService.register(payload);
    res.status(201).json(new ApiResponse("OTP sent to email", { email: payload.email }));
  });

  verifyOtp = AsyncHandler.wrap(async (req, res) => {
    const payload = verifyOtpSchema.parse(req.body);
    const result = await this.getService(payload.role).verifyOtp(payload);

    if (result.refreshToken) {
      res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    res.status(200).json(
      new ApiResponse("Email verified", {
        status: result.status ?? "authenticated",
        accessToken: result.accessToken,
        intermediateToken: result.intermediateToken ?? null,
        user: result.user,
      }),
    );
  });

  login = AsyncHandler.wrap(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await this.getService(payload.role).login(payload);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json(
      new ApiResponse("Logged in", { accessToken: result.accessToken, user: result.user }),
    );
  });

  refresh = AsyncHandler.wrap(async (req, res) => {
    const rawToken = this.getRefreshTokenFromCookie(req);
    const decoded = this.tokenService.verifyRefreshToken(rawToken);
    const result = await this.getService(decoded.role).refreshToken(rawToken, decoded);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json(new ApiResponse("Token refreshed", { accessToken: result.accessToken }));
  });

  logout = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    await this.getService(req.user.role).logout(req.user);
    res.clearCookie(REFRESH_TOKEN_COOKIE, CLEAR_REFRESH_COOKIE_OPTIONS);
    res.status(200).json(new ApiResponse("Logged out", {}));
  });

  resendOtp = AsyncHandler.wrap(async (req, res) => {
    const payload = resendOtpSchema.parse(req.body);
    await this.getService(payload.role).resendOtp(payload);
    res.status(200).json(new ApiResponse("OTP resent", { email: payload.email }));
  });

  // ─── Social auth ──────────────────────────────────────────────────────────

  validateSocialParams: RequestHandler = (req, _res, next) => {
    const role = req.params["role"] as string | undefined;
    const provider = req.params["provider"] as string | undefined;

    if (role !== "brand" && role !== "creator") {
      throw new ValidationError("Invalid role parameter", "INVALID_ROUTE_PARAMS");
    }
    if (provider !== undefined && provider !== "google" && provider !== "instagram") {
      throw new ValidationError("Invalid provider parameter", "INVALID_ROUTE_PARAMS");
    }
    next();
  };

  oauthSessionMiddleware: RequestHandler = AsyncHandler.wrap(async (req, _res, next) => {
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

  initiateSocialAuth = AsyncHandler.wrap(async (req, res) => {
    const role = req.params["role"] as UserRole;
    const provider = req.params["provider"] as SocialProvider;
    const url = await this.getService(role).initiateOAuth(provider, "login");
    res.status(200).json(new ApiResponse("OAuth URL generated", { url }));
  });

  handleSocialCallback = AsyncHandler.wrap(async (req, res) => {
    const { code, state } = socialCallbackSchema.parse(req.query);
    const role = req.params["role"] as UserRole;
    const provider = req.params["provider"] as SocialProvider;
    const result = await this.getService(role).handleSocialCallback(provider, code, state);

    if (result.refreshToken) {
      res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    res.status(200).json(
      new ApiResponse("Authentication successful", {
        status: result.status,
        accessToken: result.accessToken,
        intermediateToken: result.intermediateToken,
        user: result.user,
        instagramTokenExpiringSoon: result.instagramTokenExpiringSoon,
        instagramTokenExpired: result.instagramTokenExpired,
      }),
    );
  });

  connectSocialAccount = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const role = req.params["role"] as UserRole;
    const provider = req.params["provider"] as SocialProvider;
    const url = await this.getService(role).initiateOAuth(provider, "connect", req.user.userId);
    res.status(200).json(new ApiResponse("OAuth URL generated", { url }));
  });

  completeSocialProfile = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const role = req.params["role"] as UserRole;
    const schema = role === "brand" ? brandCompleteProfileSchema : creatorCompleteProfileSchema;
    const data = schema.parse(req.body) as Partial<Record<string, unknown>>;
    const result = await this.getService(role).completeSocialProfile(
      req.user.userId,
      data,
      req.user.jti,
      req.user.exp,
    );

    if (result.refreshToken) {
      res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    }

    res.status(200).json(
      new ApiResponse("Profile completed", {
        accessToken: result.accessToken,
        user: result.user,
      }),
    );
  });

  submitInstagramEmail = AsyncHandler.wrap(async (req, res) => {
    if (!req.oauthSession) throw new AuthError("Unauthorized");
    const role = req.params["role"] as UserRole;
    const { email } = submitInstagramEmailSchema.parse(req.body);
    const result = await this.getService(role).submitInstagramEmail(
      req.oauthSession.sessionId,
      email,
    );
    res.status(200).json(
      new ApiResponse("Email submitted, OTP sent", {
        intermediateToken: result.intermediateToken,
      }),
    );
  });

  private getService(role: UserRole): BaseAuthService {
    return role === "brand" ? this.brandAuthService : this.creatorAuthService;
  }

  private getRefreshTokenFromCookie(req: Request): string {
    const cookies = req.cookies as unknown;
    const cookieRecord =
      typeof cookies === "object" && cookies !== null
        ? (cookies as Record<string, unknown>)
        : {};
    const refreshToken = cookieRecord[REFRESH_TOKEN_COOKIE];

    if (typeof refreshToken !== "string") throw new AuthError("Unauthorized");
    return refreshToken;
  }
}
