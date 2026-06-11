"use client";

import type { ReactElement } from "react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardStatCardProps = {
  icon: ReactElement;
  label: string;
  value: string;
  sub?: string;
  accentClass: string;
  iconBgClass: string;
  glowClass?: string;
};

export function DashboardStatCard({
  icon,
  label,
  value,
  sub,
  accentClass,
  iconBgClass,
  glowClass,
}: DashboardStatCardProps): ReactElement {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-5 transition-all duration-300 hover:border-border/70 hover:-translate-y-0.5 hover:shadow-lg">
      {glowClass && (
        <div
          className={cn(
            "absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-24 blur-2xl opacity-0 group-hover:opacity-25 transition-opacity duration-500",
            glowClass,
          )}
        />
      )}
      <div className={cn("absolute top-0 left-4 right-4 h-px rounded-full", accentClass)} />

      <div className="relative flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", iconBgClass)}>
          {icon}
        </div>
        {glowClass && (
          <TrendingUp className="size-3.5 text-muted-foreground/30 group-hover:text-emerald-400/60 transition-colors duration-300" />
        )}
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/55">{sub}</p>}
    </div>
  );
}
