import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

type OrbColor = "from" | "via" | "to";

type GradientOrbProps = {
  color: OrbColor;
  className?: string;
};

const colorClass: Record<OrbColor, string> = {
  from: "smoke-from",
  via: "smoke-via",
  to: "smoke-to",
};

export function GradientOrb({ color, className }: GradientOrbProps): ReactElement {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute rounded-full",
        colorClass[color],
        className,
      )}
    />
  );
}
