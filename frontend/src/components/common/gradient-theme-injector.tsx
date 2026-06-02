"use client";

import { useEffect } from "react";
import { useGradientThemeStore } from "@/stores/gradient-theme.store";

export function GradientThemeInjector(): null {
  const activeThemeId = useGradientThemeStore((s) => s.activeThemeId);
  const getActiveTheme = useGradientThemeStore((s) => s.getActiveTheme);

  useEffect(() => {
    const theme = getActiveTheme();
    const root = document.documentElement;
    root.style.setProperty("--grad-from", theme.from);
    root.style.setProperty("--grad-via", theme.via);
    root.style.setProperty("--grad-to", theme.to);
  }, [activeThemeId, getActiveTheme]);

  return null;
}
