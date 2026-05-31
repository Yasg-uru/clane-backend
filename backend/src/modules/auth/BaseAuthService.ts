import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import type { ISocialAuthStrategy } from "../../core/interfaces/ISocialAuthStrategy";
import type { IOAuthStateService } from "../../core/interfaces/IOAuthStateService";
import type { IAccountLookupRepository } from "../../core/interfaces/IAccountLookupRepository";
import { AuthError } from "../../core/errors/AuthError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ConflictError } from "../../core/errors/ConflictError";
import { RateLimitError } from "../../core/errors/RateLimitError";
import { ServiceUnavailableError } from "../../core/errors/ServiceUnavailableError";
import { UserRole, AuthProvider, SocialProvider, SocialAuthStatus } from "../../core/types";
import type {
  AuthDocument,
  JwtPayload,
  SafeBrand,
  SafeCreator,
  SafeUser,
  SocialAuthResult,
  SocialProfile,
} from "../../core/types";
import { EncryptionService } from "../../utils/crypto";
import { env } from "../../config/env";
import type { AuthResult, RefreshResult } from "./auth.types";
import { AuthMapper } from "./AuthMapper";
import type { LoginInput, ResendOtpInput, VerifyOtpInput } from "./auth.validator";
import { INSTAGRAM_TOKEN_EXPIRY_WARNING_MS } from "./social-auth.constants";
import { CreatorEvent, CREATOR_EXCHANGE_NAME } from "../../config/config.constants";

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
    protected readonly accountLookup: IAccountLookupRepository,
    protected readonly youtubeStrategy: ISocialAuthStrategy | null = null,
  ) {}

  protected abstract findUser(email: string): Promise<AuthDocument | null>;
  protected abstract findUserWithSecrets(email: string): Promise<AuthDocument | null>;
  protected abstract findUserByIdWithRefreshToken(userId: string): Promise<AuthDocument | null>;
  protected abstract updateUserRefreshToken(userId: string, hashedToken: string | null): Promise<void>;
  protected abstract updateEmailVerified(userId: string): Promise<void>;
  protected abstract findUserBySocialId(provider: SocialProvider, providerId: string): Promise<AuthDocument | null>;
  protected abstract createSocialUser(profile: SocialProfile): Promise<AuthDocument>;
  protected abstract linkSocialProviderInDb(userId: string, data: Partial<Record<string, unknown>>): Promise<void>;
  protected abstract completeSocialProfileInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<AuthDocument | null>;

  // ─── Shared concrete helpers ──────────────────────────────────────────────

  // Cross-role uniqueness spans both collections; delegated to a dedicated
  // lookup repository so role repositories stay within their own aggregate.
  protected async crossRoleEmailExists(email: string): Promise<boolean> {
    return this.accountLookup.emailExistsAcrossRoles(email);
  }

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
        status: SocialAuthStatus.ProfileIncomplete,
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

  // ─── Social auth ──────────────────────────────────────────────────────────

  async initiateOAuth(
    provider: SocialProvider,
    intent: "login" | "connect",
    userId?: string,
  ): Promise<string> {
    if (provider === SocialProvider.Youtube && intent === "login") {
      throw new ForbiddenError("YouTube OAuth is only available for account connection");
    }
    const redirectUri = this.getRedirectUri(provider);
    const state = await this.oauthStateService.generate(this.role, provider, intent, userId);
    return this.getSocialStrategy(provider).getAuthUrl(redirectUri, state);
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
        status: SocialAuthStatus.Authenticated,
        accessToken: null,
        refreshToken: null,
        intermediateToken: null,
        user: BaseAuthService.toSafeUser(user),
      };
    }

    // 2. Exchange authorization code for social profile
    const socialStrategy = this.getSocialStrategy(provider);
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

    if (provider === SocialProvider.Instagram) {
      const expiresAt = user.instagramTokenExpiresAt;
      if (expiresAt) {
        const now = Date.now();
        instagramTokenExpired = expiresAt.getTime() < now;
        instagramTokenExpiringSoon =
          !instagramTokenExpired &&
          expiresAt.getTime() < now + INSTAGRAM_TOKEN_EXPIRY_WARNING_MS;
      }
      this.eventPublisher.publish(
        CreatorEvent.InstagramDataRefresh,
        { creatorId: user._id.toString() },
        CREATOR_EXCHANGE_NAME,
      );
    }

    const linkData = this.buildSocialLinkData(user, profile);
    await this.linkSocialProviderInDb(user._id.toString(), linkData);

    const tokenPair = await this.issueTokenPair(user);
    return {
      status: SocialAuthStatus.Authenticated,
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
    if (provider === SocialProvider.Instagram && !profile.email) {
      return this.handleInstagramNoEmail(profile);
    }

    const user = await this.createSocialUser(profile);

    if (provider === SocialProvider.Instagram) {
      this.publishPlatformConnectedEvent(SocialProvider.Instagram, user._id.toString());
    }

    if (provider === SocialProvider.Google) {
      const intermediateToken = this.tokenService.generateIntermediateToken({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        purpose: "profile_completion",
      });
      return {
        status: SocialAuthStatus.ProfileIncomplete,
        accessToken: null,
        refreshToken: null,
        intermediateToken,
        user: BaseAuthService.toSafeUser(user),
      };
    }

    // Instagram with email — send OTP, issue email_verification intermediate token
    const otp = await this.otpService.generate(this.role, user.email);
    await this.emailService.sendOtp(user.email, otp);

    const intermediateToken = this.tokenService.generateIntermediateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      purpose: "email_verification",
    });
    return {
      status: SocialAuthStatus.PendingEmailVerification,
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
      status: SocialAuthStatus.PendingEmailSubmission,
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
    const redirectUri = this.getRedirectUri(provider);
    const profile = await this.getSocialStrategy(provider).exchange(code, redirectUri);

    const existingByProvider = await this.findUserBySocialId(provider, profile.providerId);
    if (existingByProvider && existingByProvider._id.toString() !== userId) {
      throw new ConflictError(
        "Social account already linked to a different user",
        "SOCIAL_ALREADY_LINKED",
      );
    }

    const linkData = this.buildSocialLinkData(null, profile);
    await this.linkSocialProviderInDb(userId, linkData);

    this.publishPlatformConnectedEvent(provider, userId);
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

    return { accessToken, refreshToken, user: AuthMapper.toSafeUser(user) };
  }

  private async issueFullSocialAuthResult(user: AuthDocument): Promise<SocialAuthResult> {
    const tokenPair = await this.issueTokenPair(user);
    return {
      status: SocialAuthStatus.Authenticated,
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
    if (provider === SocialProvider.Google) {
      return this.role === UserRole.Brand
        ? env.GOOGLE_REDIRECT_URI_BRAND
        : env.GOOGLE_REDIRECT_URI_CREATOR;
    }
    if (provider === SocialProvider.Youtube) {
      return env.YOUTUBE_REDIRECT_URI_CREATOR;
    }
    return this.role === UserRole.Brand
      ? env.INSTAGRAM_REDIRECT_URI_BRAND
      : env.INSTAGRAM_REDIRECT_URI_CREATOR;
  }

  private getSocialStrategy(provider: SocialProvider): ISocialAuthStrategy {
    if (provider === SocialProvider.Google) return this.googleStrategy;
    if (provider === SocialProvider.Youtube) {
      if (!this.youtubeStrategy) {
        throw new ForbiddenError("YouTube is not supported for this account type");
      }
      return this.youtubeStrategy;
    }
    return this.instagramStrategy;
  }

  private publishPlatformConnectedEvent(provider: SocialProvider, creatorId: string): void {
    if (provider === SocialProvider.Instagram) {
      this.eventPublisher.publish(
        CreatorEvent.InstagramConnected,
        { creatorId },
        CREATOR_EXCHANGE_NAME,
      );
    } else if (provider === SocialProvider.Youtube) {
      this.eventPublisher.publish(
        CreatorEvent.YoutubeConnected,
        { creatorId },
        CREATOR_EXCHANGE_NAME,
      );
    }
  }

  private buildSocialLinkData(
    user: AuthDocument | null,
    profile: SocialProfile,
  ): Partial<Record<string, unknown>> {
    const authProviders: string[] = user?.authProviders ? [...user.authProviders] : [];

    if (profile.provider === SocialProvider.Google) {
      if (!authProviders.includes(AuthProvider.Google)) authProviders.push(AuthProvider.Google);
      return {
        googleId: profile.providerId,
        googleConnected: true,
        googleEmail: profile.email,
        profilePhotoUrl: profile.profilePhotoUrl ?? undefined,
        authProviders,
      };
    }

    if (profile.provider === SocialProvider.Youtube) {
      if (!authProviders.includes(AuthProvider.Youtube)) authProviders.push(AuthProvider.Youtube);
      const encryptedAccessToken = profile.youtubeAccessToken
        ? EncryptionService.encryptToken(profile.youtubeAccessToken, env.INSTAGRAM_TOKEN_ENCRYPTION_KEY)
        : undefined;
      const encryptedRefreshToken = profile.youtubeRefreshToken
        ? EncryptionService.encryptToken(profile.youtubeRefreshToken, env.INSTAGRAM_TOKEN_ENCRYPTION_KEY)
        : undefined;
      return {
        youtubeChannelId: profile.youtubeChannelId ?? profile.providerId,
        youtubeConnected: true,
        youtubeAccessToken: encryptedAccessToken,
        youtubeRefreshToken: encryptedRefreshToken,
        youtubeTokenExpiresAt: profile.youtubeTokenExpiresAt ?? undefined,
        authProviders,
      };
    }

    // Instagram
    if (!authProviders.includes(AuthProvider.Instagram)) authProviders.push(AuthProvider.Instagram);
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
    if (this.role === UserRole.Brand) {
      const safeBrand: SafeBrand = {
        id: "",
        role: UserRole.Brand,
        fullName: profile.fullName,
        email: "",
        city: "",
        isEmailVerified: false,
        authProvider: AuthProvider.Instagram,
        authProviders: [AuthProvider.Instagram],
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
      role: UserRole.Creator,
      fullName: profile.fullName,
      email: "",
      city: "",
      isEmailVerified: false,
      authProvider: AuthProvider.Instagram,
      authProviders: [AuthProvider.Instagram],
      instagramHandle: profile.instagramHandle ?? "",
      instagramFollowers: profile.instagramFollowers ?? 0,
      niche: [],
      instagramProfilePicUrl: profile.profilePhotoUrl ?? undefined,
      instagramConnected: true,
      instagramVerified: true,
      youtubeConnected: false,
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

    if (user.role === UserRole.Brand) {
      const safeBrand: SafeBrand = {
        ...base,
        role: UserRole.Brand,
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
      role: UserRole.Creator,
      instagramHandle: user.instagramHandle ?? "",
      instagramFollowers: user.instagramFollowers ?? 0,
      niche: user.niche ?? [],
      instagramProfilePicUrl: user.instagramProfilePicUrl,
      instagramConnected: user.instagramConnected,
      instagramVerified: user.instagramVerified,
      instagramDataLastRefreshedAt: toIso(user.instagramDataLastRefreshedAt),
      instagramAuthenticityScore: user.instagramAuthenticityScore,
      instagramAuthenticityRisk: user.instagramAuthenticityRisk,
      youtubeConnected: user.youtubeConnected ?? false,
      youtubeChannelId: user.youtubeChannelId,
      youtubeSubscriberCount: user.youtubeSubscriberCount,
      youtubeAuthenticityScore: user.youtubeAuthenticityScore,
      youtubeAuthenticityRisk: user.youtubeAuthenticityRisk,
      googleConnected: user.googleConnected ?? false,
      isProfileComplete: user.isProfileComplete,
    };
    return safeCreator;
  }
}
