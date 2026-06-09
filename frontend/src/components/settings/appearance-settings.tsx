"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomGradientDialog } from "@/components/common/custom-gradient-dialog";
import { SettingsSectionCard } from "./settings-section-card";
import { useGradientThemeStore } from "@/stores/gradient-theme.store";
import { GRADIENT_THEMES, type GradientTheme } from "@/types/gradient-theme.types";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const THEME_MODES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AppearanceSettings(): ReactElement {
  const { theme, setTheme } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeThemeId = useGradientThemeStore((s) => s.activeThemeId);
  const customThemes = useGradientThemeStore((s) => s.customThemes);
  const setGradient = useGradientThemeStore((s) => s.setTheme);
  const addCustomTheme = useGradientThemeStore((s) => s.addCustomTheme);
  const removeCustomTheme = useGradientThemeStore((s) => s.removeCustomTheme);
  const hasHydrated = useGradientThemeStore((s) => s._hasHydrated);

  const allGradients = [...GRADIENT_THEMES, ...customThemes];

  function handleAddCustom(newTheme: Omit<GradientTheme, "id">): void {
    const id = `custom_${Date.now()}`;
    addCustomTheme({ ...newTheme, id });
    setGradient(id);
  }

  return (
    <SettingsSectionCard
      title="Appearance"
      description="Personalize how CreatorLane looks. Saved on this device."
    >
      <div className="space-y-7">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Theme</p>
          {hasHydrated ? (
            <div className="grid grid-cols-3 gap-3">
              {THEME_MODES.map((mode) => {
                const isActive = theme === mode.value;
                return (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setTheme(mode.value)}
                    className={cn(
                      "group relative flex flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                      isActive
                        ? "border-foreground/30 bg-accent shadow-sm"
                        : "border-border/60 hover:border-border hover:bg-accent/50",
                    )}
                  >
                    {isActive && (
                      <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                    <mode.icon
                      className={cn("size-5", isActive ? "text-foreground" : "text-muted-foreground")}
                    />
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {mode.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {THEME_MODES.map((m) => <Skeleton key={m.value} className="h-[88px] rounded-xl" />)}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-border/50 pt-6">
          <div>
            <p className="text-sm font-medium text-foreground">Accent gradient</p>
            <p className="text-xs text-muted-foreground">
              Used for highlights, badges and primary actions across the app.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {allGradients.map((g) => {
              const isActive = hasHydrated && g.id === activeThemeId;
              const gradient = `linear-gradient(135deg, ${g.from}, ${g.via}, ${g.to})`;
              const isCustom = "isCustom" in g && g.isCustom;
              return (
                <div key={g.id} className="group relative">
                  <button
                    type="button"
                    title={g.label}
                    aria-label={`Use ${g.label} accent`}
                    onClick={() => setGradient(g.id)}
                    className={cn(
                      "relative size-9 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                      isActive
                        ? "scale-110 ring-foreground/40"
                        : "ring-transparent hover:scale-105 hover:ring-border",
                    )}
                    style={{ background: gradient }}
                  >
                    {isActive && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check className="size-4 text-white drop-shadow" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                  {isCustom && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomTheme(g.id);
                      }}
                      aria-label={`Remove ${g.label}`}
                      className={cn(
                        "absolute -right-1 -top-1 size-3.5 rounded-full",
                        "flex items-center justify-center",
                        "bg-zinc-800 text-white opacity-0 group-hover:opacity-100",
                        "transition-opacity duration-150",
                      )}
                    >
                      <X className="size-2" strokeWidth={3} />
                    </button>
                  )}
                </div>
              );
            })}
            <button
              onClick={() => setDialogOpen(true)}
              aria-label="Create custom gradient"
              title="Create custom gradient"
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                "border-2 border-dashed border-border/60 text-muted-foreground",
                "transition-all hover:border-border hover:text-foreground hover:scale-105",
                "focus-visible:outline-none",
              )}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        <CustomGradientDialog open={dialogOpen} onOpenChange={setDialogOpen} onSave={handleAddCustom} />
      </div>
    </SettingsSectionCard>
  );
}
