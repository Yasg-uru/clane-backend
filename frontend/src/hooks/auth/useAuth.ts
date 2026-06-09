"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/domain/auth/AuthService";
import { AuthRepository } from "@/domain/auth/AuthRepository";
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
import { ROUTES } from "@/config/routes.config";
import { SocialAuthStatus, UserRole } from "@/types";

function getDashboardPath(role: string): string {
  return role === UserRole.BRAND ? ROUTES.brand.dashboard : ROUTES.creator.dashboard;
}

const authService = new AuthService(new AuthRepository());

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: ({ user, accessToken }) => {
      setSession({ ...user } as Parameters<typeof setSession>[0], accessToken);
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
  const setSession = useAuthStore((s) => s.setSession);
  const setIntermediateToken = useAuthStore((s) => s.setIntermediateToken);
  const clearIntermediateToken = useAuthStore((s) => s.clearIntermediateToken);

  return useMutation({
    mutationFn: (data: VerifyOtpInput) => authService.verifyOtp(data),
    onSuccess: (result, variables) => {
      if (result.status === SocialAuthStatus.AUTHENTICATED && result.user && result.accessToken) {
        setSession(result.user, result.accessToken);
        clearIntermediateToken();
        const role = variables.role;
        router.push(role === UserRole.BRAND ? ROUTES.brand.dashboard : ROUTES.creator.dashboard);
      } else if (result.status === SocialAuthStatus.PROFILE_INCOMPLETE) {
        if (result.intermediateToken) setIntermediateToken(result.intermediateToken);
        router.push(ROUTES.auth.completeProfile(variables.role));
      } else {
        // Standard email/password registration OTP — just go to login
        clearIntermediateToken();
        toast.success("Email verified! You can now log in.");
        router.push(ROUTES.auth.login);
      }
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
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      router.push(ROUTES.auth.login);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Logout failed. Please try again.");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => authService.forgotPassword(data),
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string; role: UserRole }) =>
      authService.resetPassword(data),
    onSuccess: () => {
      toast.success("Password reset! You can now sign in.");
      router.push(ROUTES.auth.login);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useInitiateSocialAuth() {
  return useMutation({
    mutationFn: ({ role, provider }: { role: string; provider: string }) =>
      authService.initiateSocialAuth(role, provider),
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useConnectSocialAccount() {
  return useMutation({
    mutationFn: ({ role, provider }: { role: string; provider: string }) =>
      authService.connectSocialAccount(role, provider),
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSocialCallback() {
  const setSession = useAuthStore((s) => s.setSession);
  const setIntermediateToken = useAuthStore((s) => s.setIntermediateToken);
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      role,
      provider,
      code,
      state,
    }: {
      role: string;
      provider: string;
      code: string;
      state: string;
    }) => authService.handleSocialCallback(role, provider, code, state),
    onSuccess: (result, { role }) => {
      if (result.status === SocialAuthStatus.AUTHENTICATED) {
        if (result.user && result.accessToken) {
          setSession(result.user, result.accessToken);
          router.replace(getDashboardPath(role));
        }
      } else if (result.status === SocialAuthStatus.PROFILE_INCOMPLETE) {
        if (result.intermediateToken) {
          setIntermediateToken(result.intermediateToken);
        }
        router.replace(ROUTES.auth.completeProfile(role));
      } else if (result.status === SocialAuthStatus.PENDING_EMAIL_SUBMISSION) {
        if (result.intermediateToken) {
          setIntermediateToken(result.intermediateToken);
        }
        router.replace(ROUTES.auth.instagramEmail(role));
      } else if (result.status === SocialAuthStatus.PENDING_EMAIL_VERIFICATION) {
        if (result.intermediateToken) {
          setIntermediateToken(result.intermediateToken);
        }
        router.replace(ROUTES.auth.verifyEmail);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
      router.push(ROUTES.auth.login);
    },
  });
}

export function useCompleteSocialProfile() {
  const setSession = useAuthStore((s) => s.setSession);
  const clearIntermediateToken = useAuthStore((s) => s.clearIntermediateToken);
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      role,
      data,
      intermediateToken,
    }: {
      role: string;
      data: BrandCompleteProfileInput | CreatorCompleteProfileInput;
      intermediateToken: string;
    }) => authService.completeSocialProfile(role, data, intermediateToken),
    onSuccess: ({ user, accessToken }, { role }) => {
      setSession({ ...user } as Parameters<typeof setSession>[0], accessToken);
      clearIntermediateToken();
      router.push(getDashboardPath(role));
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useSubmitInstagramEmail() {
  const setIntermediateToken = useAuthStore((s) => s.setIntermediateToken);
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      role,
      data,
      intermediateToken,
    }: {
      role: string;
      data: SubmitInstagramEmailInput;
      intermediateToken: string;
    }) => authService.submitInstagramEmail(role, data, intermediateToken),
    onSuccess: (result) => {
      setIntermediateToken(result.intermediateToken);
      router.push(ROUTES.auth.verifyEmail);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
