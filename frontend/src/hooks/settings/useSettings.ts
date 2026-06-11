"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SettingsService } from "@/domain/settings/SettingsService";
import { SettingsRepository } from "@/domain/settings/SettingsRepository";
import { useAuthStore } from "@/stores/auth.store";
import type { SafeUser } from "@/types";
import type {
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/schemas/settings.schema";
import { ROUTES } from "@/config/routes.config";

const settingsService = new SettingsService(new SettingsRepository());

/** Re-syncs the authenticated user in the store without touching the active token. */
function useSyncUser(): (user: SafeUser) => void {
  return useAuthStore((s) => s.setUser);
}

export function useUpdateProfile() {
  const syncUser = useSyncUser();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => settingsService.updateProfile(data),
    onSuccess: (user) => {
      syncUser(user);
      toast.success("Profile updated.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => settingsService.changePassword(data),
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDisconnectSocial() {
  const syncUser = useSyncUser();

  return useMutation({
    mutationFn: (provider: string) => settingsService.disconnectSocial(provider),
    onSuccess: (user) => {
      syncUser(user);
      toast.success("Account disconnected.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteAccount() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => settingsService.deleteAccount(),
    onSuccess: () => {
      toast.success("Your account has been deleted.");
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.auth.login);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
