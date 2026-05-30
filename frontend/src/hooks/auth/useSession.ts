"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { AuthService } from "@/domain/auth/AuthService";
import { AuthRepository } from "@/domain/auth/AuthRepository";
import { TokenManager } from "@/domain/auth/TokenManager";

const authService = new AuthService(new AuthRepository());

export function useSessionHydration() {
  const { setSession, setHydrated, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated) return;

    authService
      .refresh()
      .then((user) => {
        const token = TokenManager.getInstance().get() ?? "";
        const rawUser = { ...user } as Parameters<typeof setSession>[0];
        setSession(rawUser, token);
      })
      .catch(() => {
        // no active session — normal on first load
      })
      .finally(() => {
        setHydrated();
      });
  }, [isHydrated, setSession, setHydrated]);
}
