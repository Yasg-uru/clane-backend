"use client";

import { useAuthStore } from "@/stores/auth.store";

/**
 * Returns true once the auth session has been established (token refreshed
 * from cookie) AND the user is authenticated. Use this as the `enabled` guard
 * in all protected useQuery hooks so they never fire with a null/expired token.
 */
export function useIsReady(): boolean {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isHydrated && isAuthenticated;
}
