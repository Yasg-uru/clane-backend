import { create } from "zustand";
import { TokenManager } from "@/domain/auth/TokenManager";
import type { SafeUser } from "@/types";

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  intermediateToken: string | null;

  setSession: (user: SafeUser, accessToken: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  setIntermediateToken: (token: string) => void;
  clearIntermediateToken: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,
  intermediateToken: null,

  setSession: (user, accessToken) => {
    TokenManager.getInstance().set(accessToken);
    set({ user, isAuthenticated: true, intermediateToken: null });
  },

  clearAuth: () => {
    TokenManager.getInstance().clear();
    set({ user: null, isAuthenticated: false, intermediateToken: null });
  },

  setHydrated: () => set({ isHydrated: true }),

  getAccessToken: () => TokenManager.getInstance().get(),

  setAccessToken: (token) => {
    TokenManager.getInstance().set(token);
  },

  setIntermediateToken: (token) => set({ intermediateToken: token }),

  clearIntermediateToken: () => set({ intermediateToken: null }),
}));
