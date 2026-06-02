import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";

const benefits: string[] = [
  "Browse 500+ active campaigns across every niche",
  "Bid on campaigns that match your rate and creative style",
  "Payments released via Razorpay — fast, no delays",
  "Build your portfolio and grow your creator brand",
];

type StatCellProps = { val: string; label: string };

function StatCell({ val, label }: StatCellProps): ReactElement {
  return (
    <div className="flex flex-col items-center py-3 text-center">
      <span className="text-sm font-bold text-foreground dark:text-white">{val}</span>
      <span className="text-[10px] text-muted-foreground dark:text-white/35">{label}</span>
    </div>
  );
}

function CreatorCard(): ReactElement {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl",
        "border border-border/60 bg-muted/40",
        "dark:border-white/10 dark:bg-white/[0.03]",
      )}
    >
      {/* Profile header */}
      <div className="flex items-center gap-3 p-4">
        <div className="ring-gradient-ig shrink-0 rounded-full">
          <div
            className={cn(
              "size-11 rounded-full flex items-center justify-center text-sm font-bold",
              "bg-muted text-muted-foreground",
              "dark:bg-white/10 dark:text-white/70",
            )}
          >
            PC
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground dark:text-white">@priya.creates</p>
          <p className="text-[11px] text-muted-foreground dark:text-white/40">Fashion · Mumbai</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold",
            "bg-ig-orange/10 text-ig-orange",
          )}
        >
          ₹45K
        </span>
      </div>

      {/* Stats row */}
      <div
        className={cn(
          "grid grid-cols-3 divide-x border-t",
          "divide-border/50 border-border/50",
          "dark:divide-white/8 dark:border-white/8",
        )}
      >
        <StatCell val="180K" label="Followers" />
        <StatCell val="24" label="Collabs" />
        <StatCell val="₹1.2L+" label="Earned" />
      </div>

      {/* Latest campaign */}
      <div
        className={cn(
          "border-t px-4 py-3",
          "border-border/50 dark:border-white/8",
        )}
      >
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 dark:text-white/30">
          Latest Campaign
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-green-500" />
            <span className="text-xs text-foreground/80 dark:text-white/60">StyleKart Festive</span>
          </div>
          <span className="text-xs font-semibold text-ig-orange">₹45,000</span>
        </div>
      </div>
    </div>
  );
}

export function AuthPanelCreator(): ReactElement {
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
          For creators
        </p>
        <h2 className="mb-5 text-4xl font-bold leading-[1.1] text-foreground dark:text-white xl:text-5xl">
          Turn followers
          <br />
          <span className="text-gradient-ig">into income.</span>
        </h2>
        <p className="max-w-sm leading-relaxed text-muted-foreground dark:text-white/50">
          Discover campaigns, pitch your creativity, and get paid securely. Your audience is your
          superpower.
        </p>

        {/* Benefits */}
        <ul className="mt-9 space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-3 text-sm">
              <CheckCircle className="mt-0.5 size-4 shrink-0 text-ig-orange" />
              <span className="text-muted-foreground dark:text-white/60">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Instagram-style creator card */}
      <CreatorCard />
    </>
  );
}
