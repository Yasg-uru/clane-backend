import type { CookieOptions, Request } from "express";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  brandRegisterSchema,
  creatorRegisterSchema,
  loginSchema,
  resendOtpSchema,
  verifyOtpSchema,
} from "./auth.validator";
import * as authService from "./auth.service";

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

const getRefreshTokenFromCookie = (req: Request): string => {
  const cookies = req.cookies as unknown;
  const cookieRecord =
    typeof cookies === "object" && cookies !== null
      ? (cookies as Record<string, unknown>)
      : {};
  const refreshToken = cookieRecord[REFRESH_TOKEN_COOKIE];

  if (typeof refreshToken !== "string") {
    throw new ApiError(401, "Unauthorized");
  }

  return refreshToken;
};

export const registerBrand = asyncHandler(async (req, res) => {
  const payload = brandRegisterSchema.parse(req.body);
  await authService.registerBrand(payload);

  res
    .status(201)
    .json(new ApiResponse("OTP sent to email", { email: payload.email }));
});

export const registerCreator = asyncHandler(async (req, res) => {
  const payload = creatorRegisterSchema.parse(req.body);
  await authService.registerCreator(payload);

  res
    .status(201)
    .json(new ApiResponse("OTP sent to email", { email: payload.email }));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const payload = verifyOtpSchema.parse(req.body);
  const result = await authService.verifyEmailOtp(payload);

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  res.status(200).json(
    new ApiResponse("Email verified", {
      accessToken: result.accessToken,
      user: result.user,
    }),
  );
});

export const login = asyncHandler(async (req, res) => {
  const payload = loginSchema.parse(req.body);
  const result = await authService.login(payload);

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  res.status(200).json(
    new ApiResponse("Logged in", {
      accessToken: result.accessToken,
      user: result.user,
    }),
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = getRefreshTokenFromCookie(req);
  const result = await authService.refresh(refreshToken);

  res.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, refreshCookieOptions);
  res.status(200).json(
    new ApiResponse("Token refreshed", {
      accessToken: result.accessToken,
    }),
  );
});

export const logout = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized");
  }

  await authService.logout(req.user);
  res.clearCookie(REFRESH_TOKEN_COOKIE, clearRefreshCookieOptions);
  res.status(200).json(new ApiResponse("Logged out", {}));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const payload = resendOtpSchema.parse(req.body);
  await authService.resendOtp(payload);

  res.status(200).json(new ApiResponse("OTP resent", { email: payload.email }));
});
