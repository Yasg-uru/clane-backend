import type { ReactElement } from "react";
import Link from "next/link";
import { Briefcase, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";

type MiniStatProps = {
  icon: ReactElement;
  value: string;
  label: string;
};

function MiniStat({ icon, value, label }: MiniStatProps): ReactElement {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-xl p-4",
        "bg-muted/60 border border-border/50",
        "dark:glass dark:border-white/10",
      )}
    >
      <div className="text-muted-foreground dark:text-white/50">{icon}</div>
      <p className="text-lg font-bold text-foreground dark:text-white">{value}</p>
      <p className="text-[11px] text-muted-foreground dark:text-white/40">{label}</p>
    </div>
  );
}

export function AuthPanelLogin(): ReactElement {
  return (
    <>
      {/* Logo */}
      <Link href={ROUTES.home} className="flex items-center gap-0.5 text-2xl font-bold">
        <span className="text-gradient-ig">Creator</span>
        <span className="text-foreground dark:text-white">Lane</span>
      </Link>

      {/* Main content */}
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground dark:text-white/40">
          Welcome back
        </p>
        <h2 className="mb-5 text-4xl font-bold leading-[1.1] text-foreground dark:text-white xl:text-5xl">
          Your campaigns
          <br />
          <span className="text-gradient-ig">are waiting.</span>
        </h2>
        <p className="max-w-sm leading-relaxed text-muted-foreground dark:text-white/50">
          Creators are bidding. Brands are launching. Join thousands who are already building on
          CreatorLane.
        </p>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          <MiniStat icon={<Briefcase className="size-4" />} value="500+" label="Active Campaigns" />
          <MiniStat icon={<Users className="size-4" />} value="10K+" label="Verified Creators" />
          <MiniStat icon={<TrendingUp className="size-4" />} value="₹2Cr+" label="Paid Out" />
        </div>
      </div>

      {/* Bottom testimonial */}
      <div
        className={cn(
          "rounded-2xl p-5",
          "bg-muted/50 border border-border/50",
          "dark:glass dark:border-white/10",
        )}
      >
        <p className="text-sm italic leading-relaxed text-muted-foreground dark:text-white/60">
          &ldquo;CreatorLane transformed how we discover influencers. The escrow system is a
          genuine game changer — we&apos;ll never go back.&rdquo;
        </p>
        <p className="mt-3 text-xs text-muted-foreground/70 dark:text-white/35">
          — Priya Sharma, Marketing Head · StyleKart
        </p>
      </div>
    </>
  );
}
