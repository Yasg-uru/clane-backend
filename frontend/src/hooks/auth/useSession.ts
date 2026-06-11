"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { performTokenRefresh } from "@/lib/api/client";

export function useSessionHydration(): void {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setSession = useAuthStore((s) => s.setSession);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (isHydrated) return;

    let cancelled = false;

    performTokenRefresh()
      .then(({ accessToken, user }) => {
        if (!cancelled) setSession(user, accessToken);
      })
      .catch(() => {
        // No active session — expected on first visit or after logout.
      })
      .finally(() => {
        if (!cancelled) setHydrated();
      });

    return () => {
      cancelled = true;
    };
  // setSession and setHydrated are stable Zustand action references.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);
}
