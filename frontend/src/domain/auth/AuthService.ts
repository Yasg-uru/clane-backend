import { UserRole, type SafeUser, type SocialAuthCallbackResult } from "@/types";
import type {
  BrandRegisterInput,
  CreatorRegisterInput,
  ForgotPasswordInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
  BrandCompleteProfileInput,
  CreatorCompleteProfileInput,
  SubmitInstagramEmailInput,
} from "@/schemas/auth.schema";
import { normalizeError } from "@/lib/api/error-handler";
import type { IAuthRepository } from "./AuthRepository";
import { BrandUser } from "./entities/BrandUser";
import { CreatorUser } from "./entities/CreatorUser";
import type { User } from "./entities/User";

export class AuthService {
  constructor(private readonly authRepository: IAuthRepository) {}

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

  async verifyOtp(data: VerifyOtpInput): Promise<SocialAuthCallbackResult> {
    try {
      return await this.authRepository.verifyOtp(data);
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

  async login(data: LoginInput): Promise<{ user: User; accessToken: string }> {
    try {
      const result = await this.authRepository.login(data);
      return { user: this.buildUserEntity(result.user), accessToken: result.accessToken };
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await this.authRepository.logout();
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    try {
      await this.authRepository.forgotPassword(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async resetPassword(data: {
    token: string;
    newPassword: string;
    role: UserRole;
  }): Promise<void> {
    try {
      await this.authRepository.resetPassword(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async initiateSocialAuth(role: string, provider: string): Promise<string> {
    try {
      return await this.authRepository.initiateSocialAuth(role, provider);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async handleSocialCallback(
    role: string,
    provider: string,
    code: string,
    state: string,
  ): Promise<SocialAuthCallbackResult> {
    try {
      return await this.authRepository.handleSocialCallback(role, provider, code, state);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async connectSocialAccount(role: string, provider: string): Promise<string> {
    try {
      return await this.authRepository.connectSocialAccount(role, provider);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async completeSocialProfile(
    role: string,
    data: BrandCompleteProfileInput | CreatorCompleteProfileInput,
    intermediateToken: string,
  ): Promise<{ user: User; accessToken: string }> {
    try {
      const result = await this.authRepository.completeSocialProfile(role, data, intermediateToken);
      return { user: this.buildUserEntity(result.user), accessToken: result.accessToken };
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async submitInstagramEmail(
    role: string,
    data: SubmitInstagramEmailInput,
    intermediateToken: string,
  ): Promise<{ intermediateToken: string }> {
    try {
      return await this.authRepository.submitInstagramEmail(role, data, intermediateToken);
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
