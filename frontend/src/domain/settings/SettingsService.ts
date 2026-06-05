import type { SafeUser } from "@/types";
import type { NotificationPreferences } from "@/types/settings.types";
import type { UpdateProfileInput, ChangePasswordInput } from "@/schemas/settings.schema";
import { normalizeError } from "@/lib/api/error-handler";
import type { ISettingsRepository } from "./SettingsRepository";

/**
 * Orchestrates account-settings use-cases. Framework-agnostic: no React, no HTTP.
 * Receives its repository via constructor injection.
 */
export class SettingsService {
  constructor(private readonly repo: ISettingsRepository) {}

  async updateProfile(data: UpdateProfileInput): Promise<SafeUser> {
    try {
      return await this.repo.updateProfile(data);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async changePassword(data: ChangePasswordInput): Promise<void> {
    try {
      // confirmPassword is a client-only guard — it never leaves the browser.
      await this.repo.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async updateNotificationPreferences(prefs: NotificationPreferences): Promise<void> {
    try {
      await this.repo.updateNotificationPreferences(prefs);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async disconnectSocial(provider: string): Promise<SafeUser> {
    try {
      return await this.repo.disconnectSocial(provider);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await this.repo.deleteAccount();
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
