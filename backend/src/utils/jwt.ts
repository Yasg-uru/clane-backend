import crypto from "crypto";
import jwt, {
  type JwtPayload as JsonWebTokenPayload,
  type SignOptions,
  type VerifyOptions,
} from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./ApiError";
import type { JwtPayload, UserRole } from "../types";

const JWT_ISSUER = "creatorlane";
const JWT_AUDIENCE = "creatorlane-users";

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

const verifyOptions: VerifyOptions = {
  algorithms: ["HS256"],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

const isUserRole = (role: unknown): role is UserRole => {
  return role === "brand" || role === "creator";
};

const normalizePayload = (
  decoded: string | JsonWebTokenPayload,
): JwtPayload => {
  if (typeof decoded === "string") {
    throw new ApiError(401, "Unauthorized");
  }

  const { userId, role, email, jti, exp } = decoded;

  if (
    typeof userId !== "string" ||
    !isUserRole(role) ||
    typeof email !== "string"
  ) {
    throw new ApiError(401, "Unauthorized");
  }

  return {
    userId,
    role,
    email,
    jti: typeof jti === "string" ? jti : undefined,
    exp: typeof exp === "number" ? exp : undefined,
  };
};

export const signAccessToken = (payload: JwtPayload): string => {
  // Attach a unique jti so individual tokens can be blacklisted on logout.
  return jwt.sign(
    { userId: payload.userId, role: payload.role, email: payload.email, jti: crypto.randomUUID() },
    env.JWT_ACCESS_SECRET,
    accessTokenOptions,
  );
};

export const signRefreshToken = (payload: JwtPayload): string => {
  return jwt.sign(
    { userId: payload.userId, role: payload.role, email: payload.email },
    env.JWT_REFRESH_SECRET,
    refreshTokenOptions,
  );
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return normalizePayload(jwt.verify(token, env.JWT_ACCESS_SECRET, verifyOptions));
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return normalizePayload(jwt.verify(token, env.JWT_REFRESH_SECRET, verifyOptions));
};
