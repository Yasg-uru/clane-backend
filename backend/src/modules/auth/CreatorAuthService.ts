import bcrypt from "bcryptjs";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import type { ISocialAuthStrategy } from "../../core/interfaces/ISocialAuthStrategy";
import type { IOAuthStateService } from "../../core/interfaces/IOAuthStateService";
import type { IAccountLookupRepository } from "../../core/interfaces/IAccountLookupRepository";
import { SocialProvider } from "../../core/types";
import { AuthError } from "../../core/errors/AuthError";
import { ConflictError } from "../../core/errors/ConflictError";
import { UserRole, AuthProvider } from "../../core/types";
import type { AuthDocument, SocialProfile, WriteData } from "../../core/types";
import type { Creator } from "../../models/Creator.model";
import type { ICreatorRepository } from "../../core/interfaces/ICreatorRepository";
import { EncryptionService } from "../../utils/crypto";
import { env } from "../../config/env";
import { BaseAuthService } from "./BaseAuthService";
import { BCRYPT_SALT_ROUNDS } from "./auth.constants";
import { AuthEvent } from "../../config/config.constants";
import type { CreatorRegisterInput } from "./auth.validator";

export class CreatorAuthService extends BaseAuthService {
  protected readonly role: UserRole = UserRole.Creator;

  constructor(
    private readonly creatorRepository: ICreatorRepository,
    tokenService: ITokenService,
    otpService: IOtpService,
    emailService: IEmailService,
    eventPublisher: IEventPublisher,
    strategy: IAuthStrategy,
    googleStrategy: ISocialAuthStrategy,
    instagramStrategy: ISocialAuthStrategy,
    oauthStateService: IOAuthStateService,
    accountLookup: IAccountLookupRepository,
    youtubeStrategy: ISocialAuthStrategy,
  ) {
    super(tokenService, otpService, emailService, eventPublisher, strategy, googleStrategy, instagramStrategy, oauthStateService, accountLookup, youtubeStrategy);
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
      role: UserRole.Creator,
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      city: data.city,
      instagramHandle: data.instagramHandle,
      instagramFollowers: data.instagramFollowers,
      niche: data.niche,
      isEmailVerified: false,
      authProvider: AuthProvider.Email,
      authProviders: [AuthProvider.Email],
      isProfileComplete: true,
    });

    await this.sendRegistrationOtp(creator.email);
    this.eventPublisher.publish(AuthEvent.UserRegistered, {
      role: UserRole.Creator,
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

  protected async updatePasswordHash(userId: string, hash: string): Promise<void> {
    await this.creatorRepository.updatePasswordHash(userId, hash);
  }

  protected async findUserBySocialId(provider: SocialProvider, providerId: string): Promise<AuthDocument | null> {
    if (provider === SocialProvider.Google) return this.creatorRepository.findByGoogleId(providerId);
    if (provider === SocialProvider.Youtube) return this.creatorRepository.findByYoutubeChannelId(providerId);
    return this.creatorRepository.findByInstagramId(providerId);
  }

  protected async createSocialUser(profile: SocialProfile): Promise<AuthDocument> {
    if (!profile.email) {
      throw new AuthError("Email is required to create user");
    }

    if (profile.provider === SocialProvider.Google) {
      return this.creatorRepository.create({
        role: UserRole.Creator,
        fullName: profile.fullName,
        email: profile.email,
        passwordHash: null,
        googleId: profile.providerId,
        googleConnected: true,
        authProvider: AuthProvider.Google,
        authProviders: [AuthProvider.Google],
        isEmailVerified: true,
        isProfileComplete: false,
        rawSocialProfile: profile.rawProfile,
      });
    }

    const encryptedToken = profile.instagramAccessToken
      ? EncryptionService.encryptToken(profile.instagramAccessToken, env.INSTAGRAM_TOKEN_ENCRYPTION_KEY)
      : undefined;

    return this.creatorRepository.create({
      role: UserRole.Creator,
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
      authProvider: AuthProvider.Instagram,
      authProviders: [AuthProvider.Instagram],
      isEmailVerified: false,
      isProfileComplete: false,
      rawSocialProfile: profile.rawProfile,
    });
  }

  protected async linkSocialProviderInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<void> {
    await this.creatorRepository.linkSocialProvider(userId, data as Partial<Creator>);
  }

  protected async completeSocialProfileInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<AuthDocument | null> {
    return this.creatorRepository.updateById(userId, { ...data, isProfileComplete: true } as WriteData<Creator>);
  }
}
