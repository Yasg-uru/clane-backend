import crypto from "crypto";
import type { RedisClient } from "../../config/RedisClient";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import { UserRole } from "../../core/types";
import type { UserRole as UserRoleType } from "../../core/types";
import {
  COOLDOWN_TTL_SECONDS,
  MAX_OTP_ATTEMPTS,
  OTP_TTL_SECONDS,
  PASSWORD_RESET_TTL_SECONDS,
} from "./otp.constants";

export class OtpService implements IOtpService {
  constructor(private readonly redisClient: RedisClient) {}

  async generate(role: UserRoleType, email: string): Promise<string> {
    const otp = crypto.randomInt(100000, 1000000).toString();
    await this.redisClient.set(this.otpKey(role, email), otp, OTP_TTL_SECONDS);
    await this.redisClient.del(this.attemptsKey(role, email), this.lockKey(role, email));
    return otp;
  }

  async verify(role: UserRoleType, email: string, otp: string): Promise<boolean> {
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

  async isLocked(role: UserRoleType, email: string): Promise<boolean> {
    return (await this.redisClient.exists(this.lockKey(role, email))) === 1;
  }

  async hasOtp(role: UserRoleType, email: string): Promise<boolean> {
    return (await this.redisClient.exists(this.otpKey(role, email))) === 1;
  }

  async trackAttempts(role: UserRoleType, email: string): Promise<number> {
    const attempts = await this.redisClient.incr(this.attemptsKey(role, email));

    if (attempts === 1) {
      await this.redisClient.expire(this.attemptsKey(role, email), OTP_TTL_SECONDS);
    }

    if (attempts >= MAX_OTP_ATTEMPTS) {
      await this.redisClient.set(this.lockKey(role, email), "1", OTP_TTL_SECONDS);
    }

    return attempts;
  }

  async checkCooldown(role: UserRoleType, email: string): Promise<boolean> {
    return (await this.redisClient.exists(this.cooldownKey(role, email))) === 1;
  }

  async setCooldown(role: UserRoleType, email: string): Promise<void> {
    await this.redisClient.set(this.cooldownKey(role, email), "1", COOLDOWN_TTL_SECONDS);
  }

  async generatePasswordResetToken(role: UserRoleType, userId: string): Promise<string> {
    const raw = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(raw).digest("hex");
    await this.redisClient.set(this.resetKey(hashed), `${role}:${userId}`, PASSWORD_RESET_TTL_SECONDS);
    return raw;
  }

  async verifyAndConsumePasswordResetToken(
    token: string,
  ): Promise<{ role: UserRoleType; userId: string } | null> {
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const stored = await this.redisClient.get(this.resetKey(hashed));
    if (!stored) return null;

    await this.redisClient.del(this.resetKey(hashed));

    const sepIndex = stored.indexOf(":");
    if (sepIndex === -1) return null;

    const role = stored.slice(0, sepIndex);
    const userId = stored.slice(sepIndex + 1);

    if (!userId || !Object.values(UserRole).includes(role as UserRoleType)) return null;

    return { role: role as UserRoleType, userId };
  }

  private otpKey(role: UserRoleType, email: string): string {
    return `otp:${role}:${email}`;
  }

  private attemptsKey(role: UserRoleType, email: string): string {
    return `otp:attempts:${role}:${email}`;
  }

  private lockKey(role: UserRoleType, email: string): string {
    return `otp:lock:${role}:${email}`;
  }

  private cooldownKey(role: UserRoleType, email: string): string {
    return `otp:cooldown:${role}:${email}`;
  }

  private resetKey(hashedToken: string): string {
    return `reset:${hashedToken}`;
  }
}
