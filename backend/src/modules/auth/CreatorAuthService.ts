import bcrypt from "bcryptjs";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import type { ISocialAuthStrategy } from "../../core/interfaces/ISocialAuthStrategy";
import type { IOAuthStateService, SocialProvider } from "../../core/interfaces/IOAuthStateService";
import { AuthError } from "../../core/errors/AuthError";
import { ConflictError } from "../../core/errors/ConflictError";
import type { AuthDocument, SocialProfile, UserRole } from "../../core/types";
import type { CreatorRepository } from "../../infrastructure/repositories/CreatorRepository";
import { EncryptionService } from "../../utils/crypto";
import { env } from "../../config/env";
import { BaseAuthService } from "./BaseAuthService";
import { BCRYPT_SALT_ROUNDS } from "./auth.constants";
import type { CreatorRegisterInput } from "./auth.validator";

export class CreatorAuthService extends BaseAuthService {
  protected readonly role: UserRole = "creator";

  constructor(
    private readonly creatorRepository: CreatorRepository,
    tokenService: ITokenService,
    otpService: IOtpService,
    emailService: IEmailService,
    eventPublisher: IEventPublisher,
    strategy: IAuthStrategy,
    googleStrategy: ISocialAuthStrategy,
    instagramStrategy: ISocialAuthStrategy,
    oauthStateService: IOAuthStateService,
  ) {
    super(tokenService, otpService, emailService, eventPublisher, strategy, googleStrategy, instagramStrategy, oauthStateService);
  }

  async register(data: CreatorRegisterInput): Promise<void> {
    const existing = await this.findUser(data.email);

    if (existing) {
      if (existing.isEmailVerified) throw new ConflictError("Email already registered");
      await this.sendRegistrationOtp(existing.email);
      return;
    }

    if (await this.crossRoleEmailExists(data.email)) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const creator = await this.creatorRepository.create({
      role: "creator",
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      city: data.city,
      instagramHandle: data.instagramHandle,
      instagramFollowers: data.instagramFollowers,
      niche: data.niche,
      isEmailVerified: false,
      authProvider: "email",
      authProviders: ["email"],
      isProfileComplete: true,
    });

    await this.sendRegistrationOtp(creator.email);
    this.eventPublisher.publish("user.registered", {
      role: "creator",
      email: creator.email,
      name: creator.fullName,
    });
  }

  protected async findUser(email: string): Promise<AuthDocument | null> {
    return this.creatorRepository.findByEmail(email);
  }

  protected async findUserWithSecrets(email: string): Promise<AuthDocument | null> {
    return this.creatorRepository.findByEmailWithSecrets(email);
  }

  protected async findUserByIdWithRefreshToken(userId: string): Promise<AuthDocument | null> {
    return this.creatorRepository.findByIdWithRefreshToken(userId);
  }

  protected async updateUserRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await this.creatorRepository.updateById(userId, { refreshToken: hashedToken });
  }

  protected async updateEmailVerified(userId: string): Promise<void> {
    await this.creatorRepository.updateById(userId, { isEmailVerified: true });
  }

  protected async crossRoleEmailExists(email: string): Promise<boolean> {
    return this.creatorRepository.emailExistsAcrossRoles(email);
  }

  protected async findUserBySocialId(provider: SocialProvider, providerId: string): Promise<AuthDocument | null> {
    if (provider === "google") return this.creatorRepository.findByGoogleId(providerId);
    return this.creatorRepository.findByInstagramId(providerId);
  }

  protected async createSocialUser(profile: SocialProfile): Promise<AuthDocument> {
    if (!profile.email) {
      throw new AuthError("Email is required to create user");
    }

    if (profile.provider === "google") {
      return this.creatorRepository.create({
        role: "creator",
        fullName: profile.fullName,
        email: profile.email,
        passwordHash: null,
        googleId: profile.providerId,
        googleConnected: true,
        authProvider: "google",
        authProviders: ["google"],
        isEmailVerified: true,
        isProfileComplete: false,
        rawSocialProfile: profile.rawProfile,
      });
    }

    const encryptedToken = profile.instagramAccessToken
      ? EncryptionService.encryptToken(profile.instagramAccessToken, env.INSTAGRAM_TOKEN_ENCRYPTION_KEY)
      : undefined;

    return this.creatorRepository.create({
      role: "creator",
      fullName: profile.fullName,
      email: profile.email,
      passwordHash: null,
      instagramId: profile.providerId,
      instagramConnected: true,
      instagramVerified: true,
      instagramHandle: profile.instagramHandle ?? undefined,
      instagramFollowers: profile.instagramFollowers ?? undefined,
      instagramBio: profile.instagramBio ?? undefined,
      instagramProfilePicUrl: profile.profilePhotoUrl ?? undefined,
      instagramAccessToken: encryptedToken,
      instagramTokenExpiresAt: profile.instagramTokenExpiresAt ?? undefined,
      authProvider: "instagram",
      authProviders: ["instagram"],
      isEmailVerified: false,
      isProfileComplete: false,
      rawSocialProfile: profile.rawProfile,
    });
  }

  protected async linkSocialProviderInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<void> {
    await this.creatorRepository.linkSocialProvider(userId, data);
  }

  protected async completeSocialProfileInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<AuthDocument | null> {
    return this.creatorRepository.updateById(userId, { ...data, isProfileComplete: true });
  }
}
