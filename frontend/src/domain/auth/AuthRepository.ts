import type { ApiResponse, LoginResult, RefreshResult } from "@/types";
import type {
  BrandRegisterInput,
  CreatorRegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
} from "@/schemas/auth.schema";
import { apiClient } from "@/lib/api/client";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export interface IAuthRepository {
  registerBrand(data: BrandRegisterInput): Promise<void>;
  registerCreator(data: CreatorRegisterInput): Promise<void>;
  verifyOtp(data: VerifyOtpInput): Promise<void>;
  resendOtp(data: ResendOtpInput): Promise<void>;
  login(data: LoginInput): Promise<LoginResult>;
  refresh(): Promise<RefreshResult>;
  logout(): Promise<void>;
}

export class AuthRepository implements IAuthRepository {
  async registerBrand(data: BrandRegisterInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.registerBrand, data);
  }

  async registerCreator(data: CreatorRegisterInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.registerCreator, data);
  }

  async verifyOtp(data: VerifyOtpInput): Promise<void> {
    await apiClient.post<ApiResponse<void>>(AUTH_ENDPOINTS.verifyOtp, data);
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
}
