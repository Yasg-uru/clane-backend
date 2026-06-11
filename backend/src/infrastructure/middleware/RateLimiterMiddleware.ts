import type { NextFunction, Request, Response } from "express";
import rateLimit, { ipKeyGenerator, type RateLimitRequestHandler } from "express-rate-limit";
import { RedisStore, type RedisReply } from "rate-limit-redis";
import { env } from "../../config/env";
import type { RedisClient } from "../../config/RedisClient";

export class RateLimiterMiddleware {
  readonly auth: RateLimitRequestHandler;
  readonly resendOtp: RateLimitRequestHandler;

  constructor(private readonly redisClient: RedisClient) {
    if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
      this.auth = this.createNoopLimiter();
      this.resendOtp = this.createNoopLimiter();
      return;
    }

    this.auth = this.createLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
    this.resendOtp = this.createResendOtpLimiter();
  }

  private createNoopLimiter(): RateLimitRequestHandler {
    return ((
      _req: Request,
      _res: Response,
      next: NextFunction,
    ) => next()) as unknown as RateLimitRequestHandler;
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
        return email || ipKeyGenerator(req.ip ?? "127.0.0.1");
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
