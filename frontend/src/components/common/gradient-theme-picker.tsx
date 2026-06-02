"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { Check, Palette, Plus, X } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { GRADIENT_THEMES, type GradientTheme } from "@/types/gradient-theme.types";
import { useGradientThemeStore } from "@/stores/gradient-theme.store";

// ─── Swatch ──────────────────────────────────────────────────────────────────

type SwatchProps = {
  theme: GradientTheme;
  isActive: boolean;
  onSelect: () => void;
  onRemove?: () => void;
};

function ThemeSwatch({ theme, isActive, onSelect, onRemove }: SwatchProps): ReactElement {
  const gradient = `linear-gradient(135deg, ${theme.from}, ${theme.via}, ${theme.to})`;

  return (
    <div className="group relative">
      <button
        onClick={onSelect}
        title={theme.label}
        aria-label={`Select ${theme.label} theme`}
        className={cn(
          "relative size-8 rounded-full transition-all duration-200",
          "ring-2 ring-offset-2 ring-offset-background",
          isActive
            ? "ring-white/80 scale-110"
            : "ring-transparent hover:ring-white/40 hover:scale-105",
          "focus-visible:outline-none",
        )}
        style={{ background: gradient }}
      >
        {isActive && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Check className="size-3.5 text-white drop-shadow-sm" strokeWidth={3} />
          </span>
        )}
      </button>

      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          aria-label={`Remove ${theme.label} theme`}
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
}

// ─── Custom gradient Dialog ───────────────────────────────────────────────────

type CustomGradientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (theme: Omit<GradientTheme, "id">) => void;
};

function CustomGradientDialog({ open, onOpenChange, onSave }: CustomGradientDialogProps): ReactElement {
  const [from, setFrom] = useState("#8B5CF6");
  const [via, setVia] = useState("#EC4899");
  const [to, setTo] = useState("#F97316");
  const [name, setName] = useState("");

  const previewGradient = `linear-gradient(135deg, ${from}, ${via}, ${to})`;

  function handleSave(): void {
    onSave({ label: name.trim() || "Custom", from, via, to, isCustom: true });
    onOpenChange(false);
    // reset for next use
    setFrom("#8B5CF6");
    setVia("#EC4899");
    setTo("#F97316");
    setName("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs" showCloseButton>
        <DialogHeader>
          <DialogTitle>Custom gradient</DialogTitle>
        </DialogHeader>

        {/* Live preview */}
        <div
          className="h-14 w-full rounded-xl shadow-inner"
          style={{ background: previewGradient }}
        />

        {/* Color stops */}
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { label: "From", value: from, onChange: setFrom },
              { label: "Via", value: via, onChange: setVia },
              { label: "To", value: to, onChange: setTo },
            ] as const
          ).map(({ label, value, onChange }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {label}
              </Label>
              <div className="relative">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={cn(
                    "size-10 cursor-pointer rounded-lg border-0 p-0.5",
                    "bg-transparent",
                    "focus:outline-none focus:ring-2 focus:ring-ring/40",
                  )}
                  aria-label={`${label} color`}
                />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">
                {value.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Name (optional)</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Brand"
            maxLength={20}
            className="h-8 text-sm"
          />
        </div>

        <DialogFooter showCloseButton={false}>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="bg-gradient-ig text-white hover:opacity-90" onClick={handleSave}>
            Add theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main picker ─────────────────────────────────────────────────────────────

export function GradientThemePicker(): ReactElement {
  const activeThemeId = useGradientThemeStore((s) => s.activeThemeId);
  const setTheme = useGradientThemeStore((s) => s.setTheme);
  const getActiveTheme = useGradientThemeStore((s) => s.getActiveTheme);
  const customThemes = useGradientThemeStore((s) => s.customThemes);
  const addCustomTheme = useGradientThemeStore((s) => s.addCustomTheme);
  const removeCustomTheme = useGradientThemeStore((s) => s.removeCustomTheme);

  const activeTheme = getActiveTheme();
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeGradient = `linear-gradient(135deg, ${activeTheme.from}, ${activeTheme.via}, ${activeTheme.to})`;

  function handleAddCustom(theme: Omit<GradientTheme, "id">): void {
    const id = `custom_${Date.now()}`;
    addCustomTheme({ ...theme, id });
    setTheme(id);
  }

  return (
    <>
      <HoverCard>
        <HoverCardTrigger
          aria-label="Change gradient theme"
          className={cn(
            "relative flex size-8 items-center justify-center rounded-lg transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
          )}
        >
          <span
            className="size-4 rounded-full shadow-sm"
            style={{ background: activeGradient }}
          />
        </HoverCardTrigger>

        <HoverCardContent
          side="bottom"
          align="end"
          sideOffset={8}
          className={cn(
            "w-auto p-3",
            "bg-background/90 backdrop-blur-xl",
            "border border-white/10",
            "dark:bg-zinc-900/90",
          )}
        >
          <div className="mb-2.5 flex items-center gap-1.5">
            <Palette className="size-3 text-muted-foreground" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Theme
            </span>
          </div>

          {/* Built-in swatches */}
          <div className="flex flex-wrap gap-2">
            {GRADIENT_THEMES.map((theme) => (
              <ThemeSwatch
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeThemeId}
                onSelect={() => setTheme(theme.id)}
              />
            ))}

            {/* Custom swatches */}
            {customThemes.map((theme) => (
              <ThemeSwatch
                key={theme.id}
                theme={theme}
                isActive={theme.id === activeThemeId}
                onSelect={() => setTheme(theme.id)}
                onRemove={() => removeCustomTheme(theme.id)}
              />
            ))}

            {/* Add custom */}
            <button
              onClick={() => setDialogOpen(true)}
              aria-label="Create custom gradient"
              title="Create custom gradient"
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                "border border-dashed border-white/30 text-muted-foreground",
                "transition-all hover:border-white/60 hover:text-foreground hover:scale-105",
                "focus-visible:outline-none",
              )}
            >
              <Plus className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            {activeTheme.label}
          </p>
        </HoverCardContent>
      </HoverCard>

      <CustomGradientDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleAddCustom}
      />
    </>
  );
}
