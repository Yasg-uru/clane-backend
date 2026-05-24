import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import { AuthError } from "../../core/errors/AuthError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ConflictError } from "../../core/errors/ConflictError";
import { RateLimitError } from "../../core/errors/RateLimitError";
import type { AuthDocument, JwtPayload, SafeBrand, SafeCreator, SafeUser, UserRole } from "../../core/types";
import type { AuthResult, RefreshResult } from "./auth.types";
import type { LoginInput, ResendOtpInput, VerifyOtpInput } from "./auth.validator";

export abstract class BaseAuthService {
  protected abstract readonly role: UserRole;

  constructor(
    protected readonly tokenService: ITokenService,
    protected readonly otpService: IOtpService,
    protected readonly emailService: IEmailService,
    protected readonly eventPublisher: IEventPublisher,
    protected readonly strategy: IAuthStrategy,
  ) {}

  protected abstract findUser(email: string): Promise<AuthDocument | null>;
  protected abstract findUserWithSecrets(email: string): Promise<AuthDocument | null>;
  protected abstract findUserByIdWithRefreshToken(userId: string): Promise<AuthDocument | null>;
  protected abstract updateUserRefreshToken(userId: string, hashedToken: string | null): Promise<void>;
  protected abstract updateEmailVerified(userId: string): Promise<void>;
  protected abstract crossRoleEmailExists(email: string): Promise<boolean>;

  async verifyOtp(data: VerifyOtpInput): Promise<AuthResult> {
    const user = await this.findUser(data.email);

    if (!user) throw new AuthError("OTP expired or invalid");
    if (user.isEmailVerified) throw new ConflictError("Email already verified");
    if (await this.otpService.isLocked(this.role, data.email)) {
      throw new AuthError("OTP expired or invalid");
    }
    if (!(await this.otpService.hasOtp(this.role, data.email))) {
      throw new AuthError("OTP expired or invalid");
    }

    const isValid = await this.otpService.verify(this.role, data.email, data.otp);

    if (!isValid) {
      await this.otpService.trackAttempts(this.role, data.email);
      if (await this.otpService.isLocked(this.role, data.email)) {
        throw new AuthError("OTP expired or invalid");
      }
      throw new AuthError("Invalid OTP");
    }

    await this.updateEmailVerified(user._id.toString());
    user.isEmailVerified = true;

    return this.issueTokenPair(user);
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await this.findUserWithSecrets(data.email);

    if (!user) throw new AuthError("Invalid credentials");
    if (!user.isEmailVerified) throw new ForbiddenError("Email not verified");

    const authenticated = await this.strategy.authenticate({
      passwordHash: user.passwordHash,
      inputPassword: data.password,
    });

    if (!authenticated) throw new AuthError("Invalid credentials");

    return this.issueTokenPair(user);
  }

  async refreshToken(rawToken: string, payload: JwtPayload): Promise<RefreshResult> {
    const user = await this.findUserByIdWithRefreshToken(payload.userId);

    if (!user || user.email !== payload.email) throw new AuthError("Unauthorized");

    const storedHash = user.refreshToken;
    const incomingHash = this.tokenService.hashToken(rawToken);

    if (!storedHash || incomingHash !== storedHash) {
      if (storedHash) {
        await this.updateUserRefreshToken(user._id.toString(), null);
      }
      throw new AuthError("Unauthorized");
    }

    const nextPayload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = this.tokenService.generateAccessToken(nextPayload);
    const nextRefreshToken = this.tokenService.generateRefreshToken(nextPayload);
    await this.updateUserRefreshToken(user._id.toString(), this.tokenService.hashToken(nextRefreshToken));

    return { accessToken, refreshToken: nextRefreshToken };
  }

  async logout(payload: JwtPayload): Promise<void> {
    await this.updateUserRefreshToken(payload.userId, null);

    if (payload.jti) {
      const ttl = payload.exp
        ? Math.max(1, Math.floor(payload.exp - Date.now() / 1000))
        : 900;
      await this.tokenService.blacklistAccessToken(payload.jti, ttl);
    }
  }

  async resendOtp(data: ResendOtpInput): Promise<void> {
    const user = await this.findUser(data.email);

    if (!user) throw new NotFoundError("User not found");
    if (user.isEmailVerified) throw new ConflictError("Email already verified");

    if (await this.otpService.checkCooldown(this.role, data.email)) {
      throw new RateLimitError("Please wait before requesting another OTP");
    }

    const otp = await this.otpService.generate(this.role, data.email);
    await this.otpService.setCooldown(this.role, data.email);
    await this.emailService.sendOtp(data.email, otp);
  }

  protected async sendRegistrationOtp(email: string): Promise<void> {
    const otp = await this.otpService.generate(this.role, email);
    await this.emailService.sendOtp(email, otp);
  }

  protected async issueTokenPair(user: AuthDocument): Promise<AuthResult> {
    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);
    const hashedToken = this.tokenService.hashToken(refreshToken);

    await this.updateUserRefreshToken(user._id.toString(), hashedToken);

    return { accessToken, refreshToken, user: BaseAuthService.toSafeUser(user) };
  }

  protected static toSafeUser(user: AuthDocument): SafeUser {
    const toIso = (value: Date | undefined): string | undefined =>
      value ? value.toISOString() : undefined;

    const base = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      city: user.city,
      isEmailVerified: user.isEmailVerified,
      authProvider: user.authProvider,
      createdAt: toIso(user.createdAt),
      updatedAt: toIso(user.updatedAt),
    };

    if (user.role === "brand") {
      const safeBrand: SafeBrand = {
        ...base,
        role: "brand",
        brandName: user.brandName,
        brandType: user.brandType,
        instagramHandle: user.instagramHandle,
        profilePhotoUrl: user.profilePhotoUrl,
        googleConnected: user.googleConnected,
        isProfileComplete: user.isProfileComplete,
      };
      return safeBrand;
    }

    const safeCreator: SafeCreator = {
      ...base,
      role: "creator",
      instagramHandle: user.instagramHandle,
      instagramFollowers: user.instagramFollowers,
      niche: user.niche,
      instagramProfilePicUrl: user.instagramProfilePicUrl,
      instagramConnected: user.instagramConnected,
      instagramVerified: user.instagramVerified,
      instagramDataLastRefreshedAt: toIso(user.instagramDataLastRefreshedAt),
    };
    return safeCreator;
  }

}
