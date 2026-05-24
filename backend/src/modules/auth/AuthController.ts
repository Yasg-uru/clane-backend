import type { Request } from "express";
import { AuthError } from "../../core/errors/AuthError";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { UserRole } from "../../core/types";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import {
  brandRegisterSchema,
  creatorRegisterSchema,
  loginSchema,
  resendOtpSchema,
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
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json(
      new ApiResponse("Email verified", { accessToken: result.accessToken, user: result.user }),
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
