"use client";

import type { ReactElement, ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GradientOrb } from "@/components/common/gradient-orb";
import { cn } from "@/lib/utils";

export type PageHeroStat = {
  value: string | number;
  label: string;
  colorClass?: string;
  borderClass?: string;
  hidden?: boolean;
};

type PageHeroProps = {
  badge: string;
  title: string;
  subtitle: string;
  stats?: PageHeroStat[];
  children?: ReactNode;
};

export function PageHero({
  badge,
  title,
  subtitle,
  stats,
  children,
}: PageHeroProps): ReactElement {
  const visibleStats = stats?.filter((s) => !s.hidden) ?? [];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 md:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
        <GradientOrb
          color="from"
          className="-right-20 -top-16 h-[280px] w-[280px] opacity-[0.10] blur-[70px]"
        />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
              <Sparkles className="mr-1 size-3" />
              {badge}
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground max-w-md">{subtitle}</p>
          </div>

          {visibleStats.length > 0 && (
            <div className="flex items-center gap-3 shrink-0">
              {visibleStats.map((stat) => (
                <div
                  key={stat.label}
                  className={cn(
                    "rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-center",
                    stat.borderClass,
                  )}
                >
                  <p className={cn("text-2xl font-bold text-foreground", stat.colorClass)}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>
    </section>
  );
}
