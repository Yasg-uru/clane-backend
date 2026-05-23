import crypto from "crypto";
import { redisClient } from "../../config/redis";
import type { UserRole } from "../../types";

const OTP_TTL_SECONDS = 600;
const COOLDOWN_TTL_SECONDS = 60;
const MAX_ATTEMPTS = 3;

const otpKey = (role: UserRole, email: string): string => {
  return `otp:${role}:${email}`;
};

const attemptsKey = (role: UserRole, email: string): string => {
  return `otp:attempts:${role}:${email}`;
};

const lockKey = (role: UserRole, email: string): string => {
  return `otp:lock:${role}:${email}`;
};

const cooldownKey = (role: UserRole, email: string): string => {
  return `otp:cooldown:${role}:${email}`;
};

export const generateOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

export const storeOtp = async (
  role: UserRole,
  email: string,
  otp: string,
): Promise<void> => {
  await redisClient.set(otpKey(role, email), otp, "EX", OTP_TTL_SECONDS);
  await redisClient.del(attemptsKey(role, email), lockKey(role, email));
};

export const hasOtp = async (
  role: UserRole,
  email: string,
): Promise<boolean> => {
  return (await redisClient.exists(otpKey(role, email))) === 1;
};

export const isOtpLocked = async (
  role: UserRole,
  email: string,
): Promise<boolean> => {
  return (await redisClient.exists(lockKey(role, email))) === 1;
};

export const verifyOtp = async (
  role: UserRole,
  email: string,
  inputOtp: string,
): Promise<boolean> => {
  const storedOtp = await redisClient.get(otpKey(role, email));

  if (!storedOtp || storedOtp.length !== inputOtp.length) {
    return false;
  }

  // [HIGH] Use constant-time comparison to prevent timing-based OTP enumeration.
  const match = crypto.timingSafeEqual(
    Buffer.from(storedOtp),
    Buffer.from(inputOtp),
  );

  if (!match) {
    return false;
  }

  await redisClient.del(
    otpKey(role, email),
    attemptsKey(role, email),
    lockKey(role, email),
  );
  return true;
};

export const trackAttempts = async (
  role: UserRole,
  email: string,
): Promise<number> => {
  const attempts = await redisClient.incr(attemptsKey(role, email));

  if (attempts === 1) {
    await redisClient.expire(attemptsKey(role, email), OTP_TTL_SECONDS);
  }

  if (attempts >= MAX_ATTEMPTS) {
    await redisClient.set(lockKey(role, email), "1", "EX", OTP_TTL_SECONDS);
  }

  return attempts;
};

export const hasOtpCooldown = async (
  role: UserRole,
  email: string,
): Promise<boolean> => {
  return (await redisClient.exists(cooldownKey(role, email))) === 1;
};

export const setOtpCooldown = async (
  role: UserRole,
  email: string,
): Promise<void> => {
  await redisClient.set(cooldownKey(role, email), "1", "EX", COOLDOWN_TTL_SECONDS);
};
