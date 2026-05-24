import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import type { ISocialAuthStrategy } from "../../core/interfaces/ISocialAuthStrategy";
import type { IOAuthStateService, SocialProvider } from "../../core/interfaces/IOAuthStateService";
import { AuthError } from "../../core/errors/AuthError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ConflictError } from "../../core/errors/ConflictError";
import { RateLimitError } from "../../core/errors/RateLimitError";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError";
import type {
  AuthDocument,
  JwtPayload,
  SafeBrand,
  SafeCreator,
  SafeUser,
  SocialAuthResult,
  SocialProfile,
  UserRole,
} from "../../core/types";
import { EncryptionService } from "../../utils/crypto";
import { env } from "../../config/env";
import type { AuthResult, RefreshResult } from "./auth.types";
import type { LoginInput, ResendOtpInput, VerifyOtpInput } from "./auth.validator";
import { INSTAGRAM_TOKEN_EXPIRY_WARNING_MS } from "./social-auth.constants";

export abstract class BaseAuthService {
  protected abstract readonly role: UserRole;

  constructor(
    protected readonly tokenService: ITokenService,
    protected readonly otpService: IOtpService,
    protected readonly emailService: IEmailService,
    protected readonly eventPublisher: IEventPublisher,
    protected readonly strategy: IAuthStrategy,
    protected readonly googleStrategy: ISocialAuthStrategy,
    protected readonly instagramStrategy: ISocialAuthStrategy,
    protected readonly oauthStateService: IOAuthStateService,
  ) {}

  // ─── Abstract methods (subclasses provide repo access) ────────────────────

  protected abstract findUser(email: string): Promise<AuthDocument | null>;
  protected abstract findUserWithSecrets(email: string): Promise<AuthDocument | null>;
  protected abstract findUserByIdWithRefreshToken(userId: string): Promise<AuthDocument | null>;
  protected abstract updateUserRefreshToken(userId: string, hashedToken: string | null): Promise<void>;
  protected abstract updateEmailVerified(userId: string): Promise<void>;
  protected abstract crossRoleEmailExists(email: string): Promise<boolean>;
  protected abstract findUserBySocialId(provider: SocialProvider, providerId: string): Promise<AuthDocument | null>;
  protected abstract createSocialUser(profile: SocialProfile): Promise<AuthDocument>;
  protected abstract linkSocialProviderInDb(userId: string, data: Partial<Record<string, unknown>>): Promise<void>;
  protected abstract completeSocialProfileInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<AuthDocument | null>;

  // ─── Email/password auth (existing) ───────────────────────────────────────

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

    // Social users with incomplete profiles get an intermediate token instead of full tokens
    if (!user.isProfileComplete) {
      const intermediateToken = this.tokenService.generateIntermediateToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        purpose: "profile_completion",
      });
      return {
        status: "profile_incomplete",
        accessToken: null,
        refreshToken: null,
        intermediateToken,
        user: BaseAuthService.toSafeUser(user),
      };
    }

    return this.issueTokenPair(user);
  }

  async login(data: LoginInput): Promise<AuthResult> {
    const user = await this.findUserWithSecrets(data.email);

    if (!user) throw new AuthError("Invalid credentials");
    if (!user.isEmailVerified) throw new ForbiddenError("Email not verified");
    if (!user.passwordHash) throw new AuthError("Invalid credentials");

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
    await this.updateUserRefreshToken(
      user._id.toString(),
      this.tokenService.hashToken(nextRefreshToken),
    );

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

  // ─── Social auth ──────────────────────────────────────────────────────────

  async initiateOAuth(
    provider: SocialProvider,
    intent: "login" | "connect",
    userId?: string,
  ): Promise<string> {
    const redirectUri = this.getRedirectUri(provider);
    const state = await this.oauthStateService.generate(this.role, provider, intent, userId);
    const strategy = provider === "google" ? this.googleStrategy : this.instagramStrategy;
    return strategy.getAuthUrl(redirectUri, state);
  }

  async handleSocialCallback(
    provider: SocialProvider,
    code: string,
    state: string,
  ): Promise<SocialAuthResult> {
    // 1. Verify and consume CSRF state — must happen before any user lookup
    const statePayload = await this.oauthStateService.verify(state);

    if (statePayload.role !== this.role || statePayload.provider !== provider) {
      throw new AuthError("Invalid OAuth state", "INVALID_OAUTH_STATE");
    }

    if (statePayload.intent === "connect") {
      if (!statePayload.userId) {
        throw new AuthError("Invalid OAuth state", "INVALID_OAUTH_STATE");
      }
      await this.handleConnectCallback(provider, code, statePayload.userId);
      const user = await this.findUserById(statePayload.userId);
      if (!user) throw new NotFoundError("User not found");
      return {
        status: "authenticated",
        accessToken: null,
        refreshToken: null,
        intermediateToken: null,
        user: BaseAuthService.toSafeUser(user),
      };
    }

    // 2. Exchange authorization code for social profile
    const socialStrategy = provider === "google" ? this.googleStrategy : this.instagramStrategy;
    const redirectUri = this.getRedirectUri(provider);
    let profile: SocialProfile;

    try {
      profile = await socialStrategy.exchange(code, redirectUri);
    } catch (err) {
      if (err instanceof AuthError || err instanceof ServiceUnavailableError) throw err;
      throw new ServiceUnavailableError("Social provider error", "SOCIAL_PROVIDER_ERROR");
    }

    // 3. Cross-role email conflict check
    if (profile.email) {
      const conflict = await this.crossRoleEmailExists(profile.email);
      if (conflict) {
        const sameRoleUser = await this.findUser(profile.email);
        if (!sameRoleUser) {
          throw new ConflictError(
            "Email already registered under a different account",
            "SOCIAL_EMAIL_CONFLICT",
          );
        }
      }
    }

    // 4. Returning user by provider ID
    const existingByProvider = await this.findUserBySocialId(provider, profile.providerId);
    if (existingByProvider) {
      return this.handleReturningUser(existingByProvider, profile, provider);
    }

    // 5. Email merge — same email, different provider
    if (profile.email) {
      const existingByEmail = await this.findUser(profile.email);
      if (existingByEmail) {
        const linkData = this.buildSocialLinkData(existingByEmail, profile);
        await this.linkSocialProviderInDb(existingByEmail._id.toString(), linkData);
        if (provider === "google" && !existingByEmail.isEmailVerified) {
          await this.updateEmailVerified(existingByEmail._id.toString());
          existingByEmail.isEmailVerified = true;
        }
        return this.issueFullSocialAuthResult(existingByEmail);
      }
    }

    // 6. New user
    return this.handleNewSocialUser(profile, provider);
  }

  async completeSocialProfile(
    userId: string,
    data: Partial<Record<string, unknown>>,
    jti?: string,
    exp?: number,
  ): Promise<AuthResult> {
    const user = await this.completeSocialProfileInDb(userId, data);
    if (!user) throw new NotFoundError("User not found");

    if (jti) {
      const ttl = exp ? Math.max(1, Math.floor(exp - Date.now() / 1000)) : 900;
      await this.tokenService.blacklistAccessToken(jti, ttl);
    }

    return this.issueTokenPair(user);
  }

  async submitInstagramEmail(
    sessionId: string,
    email: string,
  ): Promise<{ intermediateToken: string }> {
    const rawProfile = await this.oauthStateService.retrieveInstagramProfile(sessionId);
    if (!rawProfile) {
      throw new AuthError("Session expired or invalid", "INVALID_OAUTH_STATE");
    }

    const profile = rawProfile as unknown as SocialProfile;

    if (await this.crossRoleEmailExists(email)) {
      throw new ConflictError(
        "Email already registered under a different account",
        "SOCIAL_EMAIL_CONFLICT",
      );
    }

    const profileWithEmail: SocialProfile = { ...profile, email };
    const user = await this.createSocialUser(profileWithEmail);

    const otp = await this.otpService.generate(this.role, email);
    await this.emailService.sendOtp(email, otp);

    const intermediateToken = this.tokenService.generateIntermediateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      purpose: "email_verification",
    });

    return { intermediateToken };
  }

  // ─── Private social auth helpers ──────────────────────────────────────────

  private async handleReturningUser(
    user: AuthDocument,
    profile: SocialProfile,
    provider: SocialProvider,
  ): Promise<SocialAuthResult> {
    let instagramTokenExpiringSoon: boolean | undefined;
    let instagramTokenExpired: boolean | undefined;

    if (provider === "instagram") {
      const expiresAt = user.instagramTokenExpiresAt;
      if (expiresAt) {
        const now = Date.now();
        instagramTokenExpired = expiresAt.getTime() < now;
        instagramTokenExpiringSoon =
          !instagramTokenExpired &&
          expiresAt.getTime() < now + INSTAGRAM_TOKEN_EXPIRY_WARNING_MS;
      }
      this.eventPublisher.publish("creator.instagram.data.refresh", {
        userId: user._id.toString(),
        role: user.role,
      });
    }

    const linkData = this.buildSocialLinkData(user, profile);
    await this.linkSocialProviderInDb(user._id.toString(), linkData);

    const tokenPair = await this.issueTokenPair(user);
    return {
      status: "authenticated",
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      intermediateToken: null,
      user: tokenPair.user,
      instagramTokenExpiringSoon,
      instagramTokenExpired,
    };
  }

  private async handleNewSocialUser(
    profile: SocialProfile,
    provider: SocialProvider,
  ): Promise<SocialAuthResult> {
    if (provider === "instagram" && !profile.email) {
      return this.handleInstagramNoEmail(profile);
    }

    const user = await this.createSocialUser(profile);

    if (provider === "google") {
      const intermediateToken = this.tokenService.generateIntermediateToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        purpose: "profile_completion",
      });
      return {
        status: "profile_incomplete",
        accessToken: null,
        refreshToken: null,
        intermediateToken,
        user: BaseAuthService.toSafeUser(user),
      };
    }

    // Instagram with email — send OTP, issue email_verification intermediate token
    const otp = await this.otpService.generate(this.role, user.email);
    await this.emailService.sendOtp(user.email, otp);

    if (user.isProfileComplete) {
      const intermediateToken = this.tokenService.generateIntermediateToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        purpose: "email_verification",
      });
      return {
        status: "pending_email_verification",
        accessToken: null,
        refreshToken: null,
        intermediateToken,
        user: BaseAuthService.toSafeUser(user),
      };
    }

    // Instagram brand (profile incomplete) — still pending email, then profile
    const intermediateToken = this.tokenService.generateIntermediateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      purpose: "email_verification",
    });
    return {
      status: "pending_email_verification",
      accessToken: null,
      refreshToken: null,
      intermediateToken,
      user: BaseAuthService.toSafeUser(user),
    };
  }

  private async handleInstagramNoEmail(profile: SocialProfile): Promise<SocialAuthResult> {
    const sessionId = await this.oauthStateService.storeInstagramProfile(
      profile as unknown as Record<string, unknown>,
    );
    const pendingToken = this.tokenService.signInstagramPendingToken(sessionId);

    const previewUser = this.buildInstagramPreviewUser(profile);

    return {
      status: "pending_email_submission",
      accessToken: null,
      refreshToken: null,
      intermediateToken: pendingToken,
      user: previewUser,
    };
  }

  private async handleConnectCallback(
    provider: SocialProvider,
    code: string,
    userId: string,
  ): Promise<void> {
    const socialStrategy = provider === "google" ? this.googleStrategy : this.instagramStrategy;
    const redirectUri = this.getRedirectUri(provider);
    const profile = await socialStrategy.exchange(code, redirectUri);

    const existingByProvider = await this.findUserBySocialId(provider, profile.providerId);
    if (existingByProvider && existingByProvider._id.toString() !== userId) {
      throw new ConflictError(
        "Social account already linked to a different user",
        "SOCIAL_ALREADY_LINKED",
      );
    }

    const linkData = this.buildSocialLinkData(null, profile);
    await this.linkSocialProviderInDb(userId, linkData);
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

  private async issueFullSocialAuthResult(user: AuthDocument): Promise<SocialAuthResult> {
    const tokenPair = await this.issueTokenPair(user);
    return {
      status: "authenticated",
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      intermediateToken: null,
      user: tokenPair.user,
    };
  }

  protected async sendRegistrationOtp(email: string): Promise<void> {
    const otp = await this.otpService.generate(this.role, email);
    await this.emailService.sendOtp(email, otp);
  }

  protected getRedirectUri(provider: SocialProvider): string {
    if (provider === "google") {
      return this.role === "brand"
        ? env.GOOGLE_REDIRECT_URI_BRAND
        : env.GOOGLE_REDIRECT_URI_CREATOR;
    }
    return this.role === "brand"
      ? env.INSTAGRAM_REDIRECT_URI_BRAND
      : env.INSTAGRAM_REDIRECT_URI_CREATOR;
  }

  private buildSocialLinkData(
    user: AuthDocument | null,
    profile: SocialProfile,
  ): Partial<Record<string, unknown>> {
    const authProviders: string[] = user?.authProviders ? [...user.authProviders] : [];

    if (profile.provider === "google") {
      if (!authProviders.includes("google")) authProviders.push("google");
      return {
        googleId: profile.providerId,
        googleConnected: true,
        googleEmail: profile.email,
        profilePhotoUrl: profile.profilePhotoUrl ?? undefined,
        authProviders,
      };
    }

    // Instagram
    if (!authProviders.includes("instagram")) authProviders.push("instagram");
    const encryptedToken = profile.instagramAccessToken
      ? EncryptionService.encryptToken(profile.instagramAccessToken, env.INSTAGRAM_TOKEN_ENCRYPTION_KEY)
      : undefined;

    return {
      instagramId: profile.providerId,
      instagramConnected: true,
      instagramHandle: profile.instagramHandle ?? undefined,
      instagramFollowers: profile.instagramFollowers ?? undefined,
      instagramBio: profile.instagramBio ?? undefined,
      profilePhotoUrl: profile.profilePhotoUrl ?? undefined,
      instagramAccessToken: encryptedToken,
      instagramTokenExpiresAt: profile.instagramTokenExpiresAt ?? undefined,
      rawSocialProfile: profile.rawProfile,
      authProviders,
    };
  }

  private buildInstagramPreviewUser(profile: SocialProfile): SafeUser {
    if (this.role === "brand") {
      const safeBrand: SafeBrand = {
        id: "",
        role: "brand",
        fullName: profile.fullName,
        email: "",
        city: "",
        isEmailVerified: false,
        authProvider: "instagram",
        authProviders: ["instagram"],
        brandName: profile.fullName,
        brandType: "",
        instagramHandle: profile.instagramHandle ?? undefined,
        instagramFollowers: profile.instagramFollowers ?? undefined,
        instagramBio: profile.instagramBio ?? undefined,
        profilePhotoUrl: profile.profilePhotoUrl ?? undefined,
        googleConnected: false,
        instagramConnected: true,
        isProfileComplete: false,
      };
      return safeBrand;
    }
    const safeCreator: SafeCreator = {
      id: "",
      role: "creator",
      fullName: profile.fullName,
      email: "",
      city: "",
      isEmailVerified: false,
      authProvider: "instagram",
      authProviders: ["instagram"],
      instagramHandle: profile.instagramHandle ?? "",
      instagramFollowers: profile.instagramFollowers ?? 0,
      niche: [],
      instagramProfilePicUrl: profile.profilePhotoUrl ?? undefined,
      instagramConnected: true,
      instagramVerified: true,
      googleConnected: false,
      isProfileComplete: false,
    };
    return safeCreator;
  }

  protected async findUserById(userId: string): Promise<AuthDocument | null> {
    return this.findUserByIdWithRefreshToken(userId);
  }

  protected static toSafeUser(user: AuthDocument): SafeUser {
    const toIso = (value: Date | undefined): string | undefined =>
      value ? value.toISOString() : undefined;

    const base = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      city: user.city ?? "",
      isEmailVerified: user.isEmailVerified,
      authProvider: user.authProvider,
      authProviders: user.authProviders ?? [],
      createdAt: toIso(user.createdAt),
      updatedAt: toIso(user.updatedAt),
    };

    if (user.role === "brand") {
      const safeBrand: SafeBrand = {
        ...base,
        role: "brand",
        brandName: user.brandName ?? "",
        brandType: user.brandType ?? "",
        instagramHandle: user.instagramHandle,
        instagramFollowers: user.instagramFollowers,
        instagramBio: user.instagramBio,
        profilePhotoUrl: user.profilePhotoUrl,
        googleConnected: user.googleConnected,
        instagramConnected: user.instagramConnected,
        isProfileComplete: user.isProfileComplete,
      };
      return safeBrand;
    }

    const safeCreator: SafeCreator = {
      ...base,
      role: "creator",
      instagramHandle: user.instagramHandle ?? "",
      instagramFollowers: user.instagramFollowers ?? 0,
      niche: user.niche ?? [],
      instagramProfilePicUrl: user.instagramProfilePicUrl,
      instagramConnected: user.instagramConnected,
      instagramVerified: user.instagramVerified,
      instagramDataLastRefreshedAt: toIso(user.instagramDataLastRefreshedAt),
      googleConnected: user.googleConnected ?? false,
      isProfileComplete: user.isProfileComplete,
    };
    return safeCreator;
  }
}
