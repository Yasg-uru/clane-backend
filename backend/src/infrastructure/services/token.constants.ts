import type { SignOptions, VerifyOptions } from "jsonwebtoken";

export const JWT_ISSUER = "creatorlane";
export const JWT_AUDIENCE = "creatorlane-users";
export const INSTAGRAM_PENDING_PURPOSE = "instagram_email_submission" as const;

export const ACCESS_TOKEN_OPTIONS: SignOptions = {
  expiresIn: "15m",
  algorithm: "HS256",
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

export const REFRESH_TOKEN_OPTIONS: SignOptions = {
  expiresIn: "7d",
  algorithm: "HS256",
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

export const SHORT_LIVED_TOKEN_OPTIONS: SignOptions = {
  expiresIn: "10m",
  algorithm: "HS256",
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};

export const VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ["HS256"],
  issuer: JWT_ISSUER,
  audience: JWT_AUDIENCE,
};
