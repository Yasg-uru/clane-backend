import { create } from "zustand";
import { TokenManager } from "@/domain/auth/TokenManager";
import type { SafeUser } from "@/types";

interface AuthState {
  user: SafeUser | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setSession: (user: SafeUser, accessToken: string) => void;
  clearAuth: () => void;
  setHydrated: () => void;
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrated: false,

  setSession: (user, accessToken) => {
    TokenManager.getInstance().set(accessToken);
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    TokenManager.getInstance().clear();
    set({ user: null, isAuthenticated: false });
  },

  setHydrated: () => set({ isHydrated: true }),

  getAccessToken: () => TokenManager.getInstance().get(),

  setAccessToken: (token) => {
    TokenManager.getInstance().set(token);
  },
}));
