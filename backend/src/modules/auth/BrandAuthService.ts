import bcrypt from "bcryptjs";
import type { ITokenService } from "../../core/interfaces/ITokenService";
import type { IOtpService } from "../../core/interfaces/IOtpService";
import type { IEmailService } from "../../core/interfaces/IEmailService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { IAuthStrategy } from "../../core/interfaces/IAuthStrategy";
import { ConflictError } from "../../core/errors/ConflictError";
import type { AuthDocument, UserRole } from "../../core/types";
import type { BrandRepository } from "../../infrastructure/repositories/BrandRepository";
import { BaseAuthService } from "./BaseAuthService";
import { BCRYPT_SALT_ROUNDS } from "./auth.constants";
import type { BrandRegisterInput } from "./auth.validator";

export class BrandAuthService extends BaseAuthService {
  protected readonly role: UserRole = "brand";

  constructor(
    private readonly brandRepository: BrandRepository,
    tokenService: ITokenService,
    otpService: IOtpService,
    emailService: IEmailService,
    eventPublisher: IEventPublisher,
    strategy: IAuthStrategy,
  ) {
    super(tokenService, otpService, emailService, eventPublisher, strategy);
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
      role: "brand",
      fullName: data.fullName,
      email: data.email,
      passwordHash,
      city: data.city,
      brandName: data.brandName,
      brandType: data.brandType,
      instagramHandle: data.instagramHandle,
      isEmailVerified: false,
      authProvider: "email",
      isProfileComplete: true,
    });

    await this.sendRegistrationOtp(brand.email);
    this.eventPublisher.publish("user.registered", {
      role: "brand",
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

  protected async crossRoleEmailExists(email: string): Promise<boolean> {
    return this.brandRepository.emailExistsAcrossRoles(email);
  }
}
