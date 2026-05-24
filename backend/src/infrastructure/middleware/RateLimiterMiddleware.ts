import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import type { RedisClient } from "../../config/RedisClient";

export class RateLimiterMiddleware {
  readonly auth: RateLimitRequestHandler;
  readonly resendOtp: RateLimitRequestHandler;

  constructor(private readonly redisClient: RedisClient) {
    this.auth = this.createLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
    this.resendOtp = this.createResendOtpLimiter();
  }

  private createLimiter(opts: { limit: number; windowMs: number }): RateLimitRequestHandler {
    return rateLimit({
      windowMs: opts.windowMs,
      limit: opts.limit,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many auth requests, please try again later" },
      store: this.buildRedisStore(),
    });
  }

  private createResendOtpLimiter(): RateLimitRequestHandler {
    return rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 3,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: "Too many OTP requests, please try again later" },
      store: this.buildRedisStore(),
      keyGenerator: (req) => {
        const body = req.body as Record<string, unknown> | null | undefined;
        const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
        return email || req.ip || "unknown";
      },
    });
  }

  private buildRedisStore(): RedisStore {
    return new RedisStore({
      sendCommand: async (...args: string[]): Promise<RedisReply> => {
        return this.redisClient.sendCommand(...args) as Promise<RedisReply>;
      },
    });
  }
}
