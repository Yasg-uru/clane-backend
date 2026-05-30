"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/domain/auth/AuthService";
import { AuthRepository } from "@/domain/auth/AuthRepository";
import { TokenManager } from "@/domain/auth/TokenManager";
import type {
  BrandRegisterInput,
  CreatorRegisterInput,
  LoginInput,
  VerifyOtpInput,
  ResendOtpInput,
} from "@/schemas/auth.schema";
import { ROUTES } from "@/config/routes.config";
import { UserRole } from "@/types";

const authService = new AuthService(new AuthRepository());

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (user) => {
      const token = TokenManager.getInstance().get() ?? "";
      const rawUser = { ...user } as Parameters<typeof setSession>[0];
      setSession(rawUser, token);
      router.push(user.dashboardPath);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegisterBrand() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: BrandRegisterInput) => authService.registerBrand(data),
    onSuccess: (_, variables) => {
      toast.success("Account created — check your email for the OTP.");
      router.push(`${ROUTES.auth.verifyEmail}?email=${encodeURIComponent(variables.email)}&role=${UserRole.BRAND}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRegisterCreator() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: CreatorRegisterInput) => authService.registerCreator(data),
    onSuccess: (_, variables) => {
      toast.success("Account created — check your email for the OTP.");
      router.push(`${ROUTES.auth.verifyEmail}?email=${encodeURIComponent(variables.email)}&role=${UserRole.CREATOR}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useVerifyOtp() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: VerifyOtpInput) => authService.verifyOtp(data),
    onSuccess: () => {
      toast.success("Email verified! You can now log in.");
      router.push(ROUTES.auth.login);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (data: ResendOtpInput) => authService.resendOtp(data),
    onSuccess: () => {
      toast.success("OTP resent — check your inbox.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.auth.login);
    },
  });
}
