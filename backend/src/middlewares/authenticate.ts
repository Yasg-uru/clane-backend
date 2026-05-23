import type { RequestHandler } from "express";
import { redisClient } from "../config/redis";
import { ApiError } from "../utils/ApiError";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate: RequestHandler = async (req, _res, next) => {
  try {
    const authorization = req.header("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized");
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const payload = verifyAccessToken(token);

    // [HIGH] Check Redis blacklist so logout immediately invalidates the access token.
    if (payload.jti) {
      const isBlacklisted = await redisClient.get(`blacklist:at:${payload.jti}`);
      if (isBlacklisted) {
        throw new ApiError(401, "Unauthorized");
      }
    }

    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
};
