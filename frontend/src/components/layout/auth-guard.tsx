"use client";

import type { ReactNode, ReactElement } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { ROUTES } from "@/config/routes.config";

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps): ReactElement {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(ROUTES.auth.login);
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
