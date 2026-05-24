import crypto from "crypto";
import type { RedisClient } from "../../config/RedisClient";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { UserRole } from "../../core/types";
import { COOLDOWN_TTL_SECONDS, MAX_OTP_ATTEMPTS, OTP_TTL_SECONDS } from "./otp.constants";

export class OtpService implements IOtpService {
  constructor(private readonly redisClient: RedisClient) {}

  async generate(role: UserRole, email: string): Promise<string> {
    const otp = crypto.randomInt(100000, 1000000).toString();
    await this.redisClient.set(this.otpKey(role, email), otp, OTP_TTL_SECONDS);
    await this.redisClient.del(this.attemptsKey(role, email), this.lockKey(role, email));
    return otp;
  }

  async verify(role: UserRole, email: string, otp: string): Promise<boolean> {
    const stored = await this.redisClient.get(this.otpKey(role, email));

    if (!stored || stored.length !== otp.length) return false;

    const match = crypto.timingSafeEqual(Buffer.from(stored), Buffer.from(otp));
    if (!match) return false;

    await this.redisClient.del(
      this.otpKey(role, email),
      this.attemptsKey(role, email),
      this.lockKey(role, email),
    );
    return true;
  }

  async isLocked(role: UserRole, email: string): Promise<boolean> {
    return (await this.redisClient.exists(this.lockKey(role, email))) === 1;
  }

  async hasOtp(role: UserRole, email: string): Promise<boolean> {
    return (await this.redisClient.exists(this.otpKey(role, email))) === 1;
  }

  async trackAttempts(role: UserRole, email: string): Promise<number> {
    const attempts = await this.redisClient.incr(this.attemptsKey(role, email));

    if (attempts === 1) {
      await this.redisClient.expire(this.attemptsKey(role, email), OTP_TTL_SECONDS);
    }

    if (attempts >= MAX_OTP_ATTEMPTS) {
      await this.redisClient.set(this.lockKey(role, email), "1", OTP_TTL_SECONDS);
    }

    return attempts;
  }

  async checkCooldown(role: UserRole, email: string): Promise<boolean> {
    return (await this.redisClient.exists(this.cooldownKey(role, email))) === 1;
  }

  async setCooldown(role: UserRole, email: string): Promise<void> {
    await this.redisClient.set(this.cooldownKey(role, email), "1", COOLDOWN_TTL_SECONDS);
  }

  private otpKey(role: UserRole, email: string): string {
    return `otp:${role}:${email}`;
  }

  private attemptsKey(role: UserRole, email: string): string {
    return `otp:attempts:${role}:${email}`;
  }

  private lockKey(role: UserRole, email: string): string {
    return `otp:lock:${role}:${email}`;
  }

  private cooldownKey(role: UserRole, email: string): string {
    return `otp:cooldown:${role}:${email}`;
  }
}
