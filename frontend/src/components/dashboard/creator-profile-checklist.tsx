"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  cta: string;
  href: string;
  icon: ReactElement;
};

type CreatorProfileChecklistProps = {
  items: ChecklistItem[];
};

export function CreatorProfileChecklist({ items }: CreatorProfileChecklistProps): ReactElement {
  const completedCount = items.filter((i) => i.done).length;
  const completionPct = Math.round((completedCount / items.length) * 100);

  const RING_RADIUS = 32;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - completionPct / 100);

  if (completionPct === 100) return <></>;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.03]"
      />

      <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <div className="relative flex items-center justify-center">
            <svg width="88" height="88" viewBox="0 0 88 88" fill="none" className="-rotate-90">
              <circle
                cx="44"
                cy="44"
                r={RING_RADIUS}
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted/50"
              />
              <circle
                cx="44"
                cy="44"
                r={RING_RADIUS}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
                stroke="url(#ring-grad)"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--grad-from)" />
                  <stop offset="50%" stopColor="var(--grad-via)" />
                  <stop offset="100%" stopColor="var(--grad-to)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-gradient-ig leading-none">
                {completionPct}%
              </span>
              <span className="text-[10px] text-muted-foreground/50 mt-0.5 font-medium">done</span>
            </div>
          </div>
          <p className="text-xs font-semibold text-muted-foreground">Profile</p>
        </div>

        <div className="flex-1 space-y-3 min-w-0">
          <div>
            <h2 className="text-sm font-bold text-foreground">Complete Your Profile</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              A complete profile gets 3× more visibility from brands.
            </p>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200",
                  item.done
                    ? "border-emerald-500/20 bg-emerald-500/[0.05]"
                    : "border-border/60 bg-muted/20 hover:border-border hover:bg-muted/40",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg",
                      item.done
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {item.done ? <CheckCircle2 className="size-3.5" /> : item.icon}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      item.done
                        ? "text-muted-foreground/60 line-through decoration-muted-foreground/30"
                        : "text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                </div>

                {item.done ? (
                  <span className="shrink-0 ml-3 text-[10px] font-semibold text-emerald-400">
                    ✓ Done
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="shrink-0 ml-3 flex items-center gap-0.5 text-[11px] font-semibold text-gradient-ig hover:opacity-75 transition-opacity"
                  >
                    {item.cta}
                    <ChevronRight className="size-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
