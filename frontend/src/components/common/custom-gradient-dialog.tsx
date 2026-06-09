"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { GradientTheme } from "@/types/gradient-theme.types";
import { cn } from "@/lib/utils";

type CustomGradientDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (theme: Omit<GradientTheme, "id">) => void;
};

export function CustomGradientDialog({
  open,
  onOpenChange,
  onSave,
}: CustomGradientDialogProps): ReactElement {
  const [from, setFrom] = useState("#8B5CF6");
  const [via, setVia] = useState("#EC4899");
  const [to, setTo] = useState("#F97316");
  const [name, setName] = useState("");

  const previewGradient = `linear-gradient(135deg, ${from}, ${via}, ${to})`;

  const colorStops = [
    { label: "From", value: from, onChange: setFrom },
    { label: "Via", value: via, onChange: setVia },
    { label: "To", value: to, onChange: setTo },
  ] as const;

  function handleSave(): void {
    onSave({ label: name.trim() || "Custom", from, via, to, isCustom: true });
    onOpenChange(false);
    setFrom("#8B5CF6");
    setVia("#EC4899");
    setTo("#F97316");
    setName("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle>Create custom gradient</DialogTitle>
        </DialogHeader>

        <div className="h-14 w-full rounded-xl shadow-inner" style={{ background: previewGradient }} />

        <div className="grid grid-cols-3 gap-3">
          {colorStops.map(({ label, value, onChange }) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {label}
              </Label>
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "size-10 cursor-pointer rounded-lg border-0 p-0.5",
                  "bg-transparent focus:outline-none focus:ring-2 focus:ring-ring/40",
                )}
                aria-label={`${label} color`}
              />
              <span className="font-mono text-[9px] text-muted-foreground">
                {value.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

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

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-gradient-ig text-white hover:opacity-90"
            onClick={handleSave}
          >
            Add theme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
