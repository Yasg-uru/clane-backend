import type { CookieOptions, Request } from "express";
import { env } from "../../config/env";
import { AuthError } from "../../core/errors/AuthError";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { UserRole } from "../../core/types";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
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

const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: REFRESH_TOKEN_MAX_AGE_MS,
};

const clearRefreshCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
};

export class AuthController {
  constructor(
    private readonly brandAuthService: BrandAuthService,
    private readonly creatorAuthService: CreatorAuthService,
    private readonly tokenService: ITokenService,
  ) {}

  registerBrand = asyncHandler(async (req, res) => {
    const payload = brandRegisterSchema.parse(req.body);
    await this.brandAuthService.register(payload);
    res.status(201).json(new ApiResponse("OTP sent to email", { email: payload.email }));
  });

  registerCreator = asyncHandler(async (req, res) => {
    const payload = creatorRegisterSchema.parse(req.body);
    await this.creatorAuthService.register(payload);
    res.status(201).json(new ApiResponse("OTP sent to email", { email: payload.email }));
  });

  verifyOtp = asyncHandler(async (req, res) => {
    const payload = verifyOtpSchema.parse(req.body);
    const result = await this.getService(payload.role).verifyOtp(payload);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
    res.status(200).json(
      new ApiResponse("Email verified", { accessToken: result.accessToken, user: result.user }),
    );
  });

  login = asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await this.getService(payload.role).login(payload);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
    res.status(200).json(
      new ApiResponse("Logged in", { accessToken: result.accessToken, user: result.user }),
    );
  });

  refresh = asyncHandler(async (req, res) => {
    const rawToken = this.getRefreshTokenFromCookie(req);
    const decoded = this.tokenService.verifyRefreshToken(rawToken);
    const result = await this.getService(decoded.role).refreshToken(rawToken, decoded);
    res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
    res.status(200).json(new ApiResponse("Token refreshed", { accessToken: result.accessToken }));
  });

  logout = asyncHandler(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    await this.getService(req.user.role).logout(req.user);
    res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshCookieOptions);
    res.status(200).json(new ApiResponse("Logged out", {}));
  });

  resendOtp = asyncHandler(async (req, res) => {
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
