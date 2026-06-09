"use client";

import { Suspense, useEffect, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSocialCallback } from "@/hooks/auth/useAuth";
import { ROUTES } from "@/config/routes.config";

function OAuthCallbackContent() {
  const params = useParams<{ role: string; provider: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mutate } = useSocialCallback();
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

    mutate({ role, provider, code, state });
  }, [code, state, role, provider, mutate, router]);

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
