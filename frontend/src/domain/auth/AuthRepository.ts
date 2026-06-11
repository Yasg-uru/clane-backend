import type {
  ApiResponse,
  LoginResult,
  RefreshResult,
  SocialAuthCallbackResult,
  OAuthInitiateResult,
} from "@/types";
import { UserRole } from "@/types";
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
import { apiClient } from "@/lib/api/client";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export interface IAuthRepository {
  registerBrand(data: BrandRegisterInput): Promise<void>;
  registerCreator(data: CreatorRegisterInput): Promise<void>;
  verifyOtp(data: VerifyOtpInput): Promise<SocialAuthCallbackResult>;
  resendOtp(data: ResendOtpInput): Promise<void>;
  login(data: LoginInput): Promise<LoginResult>;
  refresh(): Promise<RefreshResult>;
  logout(): Promise<void>;
  forgotPassword(data: ForgotPasswordInput): Promise<void>;
  resetPassword(data: { token: string; newPassword: string; role: UserRole }): Promise<void>;
  initiateSocialAuth(role: string, provider: string): Promise<string>;
  handleSocialCallback(
    role: string,
    provider: string,
    code: string,
    state: string,
  ): Promise<SocialAuthCallbackResult>;
  connectSocialAccount(role: string, provider: string): Promise<string>;
  completeSocialProfile(
    role: string,
    data: BrandCompleteProfileInput | CreatorCompleteProfileInput,
    intermediateToken: string,
  ): Promise<LoginResult>;
  submitInstagramEmail(
    role: string,
    data: SubmitInstagramEmailInput,
    intermediateToken: string,
  ): Promise<{ intermediateToken: string }>;
}

export class AuthRepository implements IAuthRepository {
  async registerBrand(data: BrandRegisterInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.registerBrand, data);
  }

  async registerCreator(data: CreatorRegisterInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.registerCreator, data);
  }

  async verifyOtp(data: VerifyOtpInput): Promise<SocialAuthCallbackResult> {
    const response = await apiClient.post<ApiResponse<SocialAuthCallbackResult>>(
      AUTH_ENDPOINTS.verifyOtp,
      data,
    );
    return response.data.data;
  }

  async resendOtp(data: ResendOtpInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.resendOtp, data);
  }

  async login(data: LoginInput): Promise<LoginResult> {
    const response = await apiClient.post<ApiResponse<LoginResult>>(AUTH_ENDPOINTS.login, data);
    return response.data.data;
  }

  async refresh(): Promise<RefreshResult> {
    const response = await apiClient.post<ApiResponse<RefreshResult>>(AUTH_ENDPOINTS.refresh);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.logout);
  }

  async forgotPassword(data: ForgotPasswordInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.forgotPassword, data);
  }

  async resetPassword(data: { token: string; newPassword: string; role: UserRole }): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.resetPassword, data);
  }

  async initiateSocialAuth(role: string, provider: string): Promise<string> {
    const response = await apiClient.get<ApiResponse<OAuthInitiateResult>>(
      AUTH_ENDPOINTS.initiateSocialAuth(role, provider),
    );
    return response.data.data.url;
  }

  async handleSocialCallback(
    role: string,
    provider: string,
    code: string,
    state: string,
  ): Promise<SocialAuthCallbackResult> {
    const response = await apiClient.post<ApiResponse<SocialAuthCallbackResult>>(
      AUTH_ENDPOINTS.handleSocialCallback(role, provider),
      { code, state },
    );
    return response.data.data;
  }

  async connectSocialAccount(role: string, provider: string): Promise<string> {
    const response = await apiClient.post<ApiResponse<OAuthInitiateResult>>(
      AUTH_ENDPOINTS.connectSocialAccount(role, provider),
    );
    return response.data.data.url;
  }

  async completeSocialProfile(
    role: string,
    data: BrandCompleteProfileInput | CreatorCompleteProfileInput,
    intermediateToken: string,
  ): Promise<LoginResult> {
    const response = await apiClient.patch<ApiResponse<LoginResult>>(
      AUTH_ENDPOINTS.completeSocialProfile(role),
      data,
      { headers: { Authorization: `Bearer ${intermediateToken}` } },
    );
    return response.data.data;
  }

  async submitInstagramEmail(
    role: string,
    data: SubmitInstagramEmailInput,
    intermediateToken: string,
  ): Promise<{ intermediateToken: string }> {
    const response = await apiClient.post<ApiResponse<{ intermediateToken: string }>>(
      AUTH_ENDPOINTS.submitInstagramEmail(role),
      data,
      { headers: { Authorization: `Bearer ${intermediateToken}` } },
    );
    return response.data.data;
  }
}
