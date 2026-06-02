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
import type { Brand } from "../../models/Brand.model";
import type { IBrandRepository } from "../../core/interfaces/IBrandRepository";
import { EncryptionService } from "../../utils/crypto";
import { env } from "../../config/env";
import { BaseAuthService } from "./BaseAuthService";
import { BCRYPT_SALT_ROUNDS } from "./auth.constants";
import { AuthEvent } from "../../config/config.constants";
import type { BrandRegisterInput } from "./auth.validator";

export class BrandAuthService extends BaseAuthService {
  protected readonly role: UserRole = UserRole.Brand;

  constructor(
    private readonly brandRepository: IBrandRepository,
    tokenService: ITokenService,
    otpService: IOtpService,
    emailService: IEmailService,
    eventPublisher: IEventPublisher,
    strategy: IAuthStrategy,
    googleStrategy: ISocialAuthStrategy,
    instagramStrategy: ISocialAuthStrategy,
    oauthStateService: IOAuthStateService,
    accountLookup: IAccountLookupRepository,
  ) {
    super(tokenService, otpService, emailService, eventPublisher, strategy, googleStrategy, instagramStrategy, oauthStateService, accountLookup);
  }

  async register(data: BrandRegisterInput): Promise<void> {
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
    const brand = await this.brandRepository.create({
      role: UserRole.Brand,
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      city: data.city,
      brandName: data.brandName,
      brandType: data.brandType,
      instagramHandle: data.instagramHandle,
      isEmailVerified: false,
      authProvider: AuthProvider.Email,
      authProviders: [AuthProvider.Email],
      isProfileComplete: true,
    });

    await this.sendRegistrationOtp(brand.email);
    this.eventPublisher.publish(AuthEvent.UserRegistered, {
      role: UserRole.Brand,
      email: brand.email,
      name: brand.fullName,
      brandName: brand.brandName,
    });
  }

  protected async findUser(email: string): Promise<AuthDocument | null> {
    return this.brandRepository.findByEmail(email);
  }

  protected async findUserWithSecrets(email: string): Promise<AuthDocument | null> {
    return this.brandRepository.findByEmailWithSecrets(email);
  }

  protected async findUserByIdWithRefreshToken(userId: string): Promise<AuthDocument | null> {
    return this.brandRepository.findByIdWithRefreshToken(userId);
  }

  protected async updateUserRefreshToken(userId: string, hashedToken: string | null): Promise<void> {
    await this.brandRepository.updateById(userId, { refreshToken: hashedToken });
  }

  protected async updateEmailVerified(userId: string): Promise<void> {
    await this.brandRepository.updateById(userId, { isEmailVerified: true });
  }

  protected async updatePasswordHash(userId: string, hash: string): Promise<void> {
    await this.brandRepository.updatePasswordHash(userId, hash);
  }

  protected async findUserBySocialId(provider: SocialProvider, providerId: string): Promise<AuthDocument | null> {
    if (provider === SocialProvider.Google) return this.brandRepository.findByGoogleId(providerId);
    return this.brandRepository.findByInstagramId(providerId);
  }

  protected async createSocialUser(profile: SocialProfile): Promise<AuthDocument> {
    if (!profile.email) {
      throw new AuthError("Email is required to create user");
    }

    if (profile.provider === SocialProvider.Google) {
      return this.brandRepository.create({
        role: UserRole.Brand,
        fullName: profile.fullName,
        email: profile.email,
        passwordHash: null,
        googleId: profile.providerId,
        googleConnected: true,
        googleEmail: profile.email,
        profilePhotoUrl: profile.profilePhotoUrl ?? undefined,
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

    return this.brandRepository.create({
      role: UserRole.Brand,
      fullName: profile.fullName,
      email: profile.email,
      passwordHash: null,
      instagramId: profile.providerId,
      instagramConnected: true,
      instagramHandle: profile.instagramHandle ?? undefined,
      instagramFollowers: profile.instagramFollowers ?? undefined,
      instagramBio: profile.instagramBio ?? undefined,
      profilePhotoUrl: profile.profilePhotoUrl ?? undefined,
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
    await this.brandRepository.linkSocialProvider(userId, data as Partial<Brand>);
  }

  protected async completeSocialProfileInDb(
    userId: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<AuthDocument | null> {
    return this.brandRepository.updateById(userId, { ...data, isProfileComplete: true } as WriteData<Brand>);
  }
}
