import type { ApiResponse, SafeUser } from "@/types";
import type { NotificationPreferences } from "@/types/settings.types";
import type { UpdateProfileInput } from "@/schemas/settings.schema";
import { apiClient } from "@/lib/api/client";
import { SETTINGS_ENDPOINTS } from "@/lib/api/endpoints";

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export interface ISettingsRepository {
  updateProfile(data: UpdateProfileInput): Promise<SafeUser>;
  changePassword(data: ChangePasswordPayload): Promise<void>;
  updateNotificationPreferences(prefs: NotificationPreferences): Promise<void>;
  disconnectSocial(provider: string): Promise<SafeUser>;
  deleteAccount(): Promise<void>;
}

export class SettingsRepository implements ISettingsRepository {
  async updateProfile(data: UpdateProfileInput): Promise<SafeUser> {
    const response = await apiClient.patch<ApiResponse<SafeUser>>(
      SETTINGS_ENDPOINTS.updateProfile,
      data,
    );
    return response.data.data;
  }

  async changePassword(data: ChangePasswordPayload): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(SETTINGS_ENDPOINTS.changePassword, data);
  }

  async updateNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
    await apiClient.put<ApiResponse<void>>(
      SETTINGS_ENDPOINTS.notificationPreferences,
      prefs,
    );
  }

  async disconnectSocial(provider: string): Promise<SafeUser> {
    const response = await apiClient.delete<ApiResponse<SafeUser>>(
      SETTINGS_ENDPOINTS.disconnectSocial(provider),
    );
    return response.data.data;
  }

  async deleteAccount(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(SETTINGS_ENDPOINTS.deleteAccount);
  }
}
