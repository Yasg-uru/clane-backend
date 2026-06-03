"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { performTokenRefresh } from "@/lib/api/client";

export function useSessionHydration() {
  const { setSession, setHydrated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated) return;

    performTokenRefresh()
      .then(({ accessToken, user }) => {
        setSession(user, accessToken);
      })
      .catch(() => {
        // No active session — normal on first visit or after logout.
      })
      .finally(() => {
        setHydrated();
      });
  }, [isHydrated, setSession, setHydrated]);
}
