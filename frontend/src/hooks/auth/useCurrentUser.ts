"use client";

import { useAuthStore } from "@/stores/auth.store";
import { UserRole, type SafeBrand, type SafeCreator, type SafeUser } from "@/types";

export function useCurrentUser(): SafeUser | null {
  return useAuthStore((s) => s.user);
}

export function useCurrentBrand(): SafeBrand | null {
  const user = useAuthStore((s) => s.user);
  return user?.role === UserRole.BRAND ? (user as SafeBrand) : null;
}

export function useCurrentCreator(): SafeCreator | null {
  const user = useAuthStore((s) => s.user);
  return user?.role === UserRole.CREATOR ? (user as SafeCreator) : null;
}
