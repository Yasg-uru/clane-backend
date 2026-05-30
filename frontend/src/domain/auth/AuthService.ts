import { UserRole, type SafeUser } from "@/types";
import type {
  BrandRegisterInput,
  CreatorRegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
} from "@/schemas/auth.schema";
import { normalizeError } from "@/lib/api/error-handler";
import type { IAuthRepository } from "./AuthRepository";
import { TokenManager } from "./TokenManager";
import { BrandUser } from "./entities/BrandUser";
import { CreatorUser } from "./entities/CreatorUser";
import type { User } from "./entities/User";

export class AuthService {
  private readonly tokenManager: TokenManager;

  constructor(private readonly authRepository: IAuthRepository) {
    this.tokenManager = TokenManager.getInstance();
  }

  private buildUserEntity(data: SafeUser): User {
    if (data.role === UserRole.BRAND) return new BrandUser(data);
    return new CreatorUser(data);
  }

  async registerBrand(data: BrandRegisterInput): Promise<void> {
    try {
      await this.authRepository.registerBrand(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async registerCreator(data: CreatorRegisterInput): Promise<void> {
    try {
      await this.authRepository.registerCreator(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async verifyOtp(data: VerifyOtpInput): Promise<void> {
    try {
      await this.authRepository.verifyOtp(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async resendOtp(data: ResendOtpInput): Promise<void> {
    try {
      await this.authRepository.resendOtp(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async login(data: LoginInput): Promise<User> {
    try {
      const result = await this.authRepository.login(data);
      this.tokenManager.set(result.accessToken);
      return this.buildUserEntity(result.user);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async refresh(): Promise<User> {
    try {
      const result = await this.authRepository.refresh();
      this.tokenManager.set(result.accessToken);
      return this.buildUserEntity(result.user);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } finally {
      this.tokenManager.clear();
    }
  }
}
