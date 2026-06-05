import type { ReactElement } from "react";
import { cn } from "@/lib/utils";

export type CampaignStatCardProps = {
  icon: ReactElement;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
};

export function CampaignStatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: CampaignStatCardProps): ReactElement {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-sm",
        accent ? "border-transparent" : "border-border/60",
      )}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.06]"
        />
      )}
      <div
        className={cn(
          "mb-3 flex size-9 items-center justify-center rounded-xl",
          accent ? "bg-gradient-ig text-white" : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </div>
      <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-xs font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground/60">{sub}</p>}
    </div>
  );
}
