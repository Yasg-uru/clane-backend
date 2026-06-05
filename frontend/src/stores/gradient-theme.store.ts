"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GradientThemeId,
  GRADIENT_THEMES,
  type GradientTheme,
} from "@/types/gradient-theme.types";

interface GradientThemeState {
  _hasHydrated: boolean;
  activeThemeId: string;
  customThemes: GradientTheme[];
  setHasHydrated: (val: boolean) => void;
  setTheme: (id: string) => void;
  getActiveTheme: () => GradientTheme;
  getAllThemes: () => GradientTheme[];
  addCustomTheme: (theme: GradientTheme) => void;
  removeCustomTheme: (id: string) => void;
}

export const useGradientThemeStore = create<GradientThemeState>()(
  persist(
    (set, get) => ({
      _hasHydrated: false,
      activeThemeId: GradientThemeId.INSTAGRAM,
      customThemes: [],

      setHasHydrated: (val) => set({ _hasHydrated: val }),
      setTheme: (id) => set({ activeThemeId: id }),

      getAllThemes: () => [...GRADIENT_THEMES, ...get().customThemes],

      getActiveTheme: () => {
        const all = [...GRADIENT_THEMES, ...get().customThemes];
        return all.find((t) => t.id === get().activeThemeId) ?? GRADIENT_THEMES[0]!;
      },

      addCustomTheme: (theme) =>
        set((s) => ({ customThemes: [...s.customThemes, theme] })),

      removeCustomTheme: (id) =>
        set((s) => {
          const customThemes = s.customThemes.filter((t) => t.id !== id);
          const activeThemeId =
            s.activeThemeId === id ? GradientThemeId.INSTAGRAM : s.activeThemeId;
          return { customThemes, activeThemeId };
        }),
    }),
    {
      name: "clane-gradient-theme",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
