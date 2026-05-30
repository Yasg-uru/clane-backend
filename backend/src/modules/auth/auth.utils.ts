import type { Request } from "express";
import { AuthError } from "../../core/errors/AuthError";
import { REFRESH_TOKEN_COOKIE } from "./auth.constants";

export class AuthUtils {
  static getRefreshTokenFromCookie(req: Request): string {
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
