import rateLimit from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { redisClient } from "../config/redis";

const sendRedisCommand = async (...args: string[]): Promise<RedisReply> => {
  const [command, ...commandArgs] = args;

  if (!command) {
    throw new Error("Redis command is required");
  }

  return redisClient.call(command, ...commandArgs) as Promise<RedisReply>;
};

const createRedisStore = (): RedisStore => {
  return new RedisStore({
    sendCommand: sendRedisCommand,
  });
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many auth requests, please try again later",
  },
  store: createRedisStore(),
});

// [MEDIUM] Rate-limit resend-OTP per email (not just per IP) so an attacker with many IPs
// cannot spam a single inbox. The authRateLimiter above still enforces the per-IP ceiling.
export const resendOtpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many OTP requests, please try again later",
  },
  store: createRedisStore(),
  keyGenerator: (req) => {
    const body = req.body as Record<string, unknown> | null | undefined;
    const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
    return email || req.ip || "unknown";
  },
});
