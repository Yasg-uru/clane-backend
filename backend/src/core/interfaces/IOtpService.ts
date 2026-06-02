import type { UserRole } from "../types";

export interface IOtpService {
  generate(role: UserRole, email: string): Promise<string>;
  verify(role: UserRole, email: string, otp: string): Promise<boolean>;
  isLocked(role: UserRole, email: string): Promise<boolean>;
  hasOtp(role: UserRole, email: string): Promise<boolean>;
  trackAttempts(role: UserRole, email: string): Promise<number>;
  checkCooldown(role: UserRole, email: string): Promise<boolean>;
  setCooldown(role: UserRole, email: string): Promise<void>;
  generatePasswordResetToken(role: UserRole, userId: string): Promise<string>;
  verifyAndConsumePasswordResetToken(token: string): Promise<{ role: UserRole; userId: string } | null>;
}
