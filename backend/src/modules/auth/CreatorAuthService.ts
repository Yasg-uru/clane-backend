import bcrypt from "bcryptjs";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import { ConflictError } from "../../core/errors/ConflictError";
import { UserRole, AuthProvider } from "../../core/types";
import type { AuthDocument } from "../../core/types";
import type { CreatorRepository } from "../../infrastructure/repositories/CreatorRepository";
import { BaseAuthService } from "./BaseAuthService";
import { BCRYPT_SALT_ROUNDS } from "./auth.constants";
import { AuthEvent } from "../../config/config.constants";
import type { CreatorRegisterInput } from "./auth.validator";

export class CreatorAuthService extends BaseAuthService {
  protected readonly role: UserRole = UserRole.Creator;

  constructor(
    private readonly creatorRepository: CreatorRepository,
    tokenService: ITokenService,
    otpService: IOtpService,
    emailService: IEmailService,
    eventPublisher: IEventPublisher,
    strategy: IAuthStrategy,
  ) {
    super(tokenService, otpService, emailService, eventPublisher, strategy);
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

  protected async crossRoleEmailExists(email: string): Promise<boolean> {
    return this.creatorRepository.emailExistsAcrossRoles(email);
  }
}
