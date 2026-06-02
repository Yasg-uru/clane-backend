"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GradientThemeId,
  GRADIENT_THEMES,
  type GradientTheme,
} from "@/types/gradient-theme.types";

interface GradientThemeState {
  activeThemeId: string;
  customThemes: GradientTheme[];
  setTheme: (id: string) => void;
  getActiveTheme: () => GradientTheme;
  getAllThemes: () => GradientTheme[];
  addCustomTheme: (theme: GradientTheme) => void;
  removeCustomTheme: (id: string) => void;
}

export const useGradientThemeStore = create<GradientThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: GradientThemeId.INSTAGRAM,
      customThemes: [],

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
    },
  ),
);
