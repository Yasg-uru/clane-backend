"use client";

import { Suspense, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/domain/auth/AuthService";
import { AuthRepository } from "@/domain/auth/AuthRepository";
import { SocialAuthStatus, UserRole } from "@/types";
import { ROUTES } from "@/config/routes.config";

const authService = new AuthService(new AuthRepository());

function getDashboardPath(role: string): string {
  if (role === UserRole.BRAND) return ROUTES.brand.dashboard;
  return ROUTES.creator.dashboard;
}

function OAuthCallbackContent() {
  const params = useParams<{ role: string; provider: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const setIntermediateToken = useAuthStore((s) => s.setIntermediateToken);
  const hasRun = useRef(false);

  const role = params.role;
  const provider = params.provider;
  const code = searchParams.get("code") ?? "";
  const state = searchParams.get("state") ?? "";

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!code || !state) {
      toast.error("Invalid OAuth callback — missing parameters.");
      router.replace(ROUTES.auth.login);
      return;
    }

    authService
      .handleSocialCallback(role, provider, code, state)
      .then((result) => {
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
      })
      .catch((error: Error) => {
        toast.error(error.message ?? "Authentication failed. Please try again.");
        router.replace(ROUTES.auth.login);
      });
  }, [code, state, role, provider, router, setSession, setIntermediateToken]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Completing sign-in…</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
