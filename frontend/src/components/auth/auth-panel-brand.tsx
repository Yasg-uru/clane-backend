import type { ReactElement } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/routes.config";

const benefits: string[] = [
  "Verified creator profiles with real social analytics",
  "Receive bids from matched creators within hours",
  "Payments secured by escrow — zero financial risk",
  "Real-time campaign analytics and ROI tracking",
];

const trustedBrands: string[] = ["FitLife", "StyleKart", "Urban Closet", "TechZone", "GlowUp"];

export function AuthPanelBrand(): ReactElement {
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
          For brands
        </p>
        <h2 className="mb-5 text-4xl font-bold leading-[1.1] text-foreground dark:text-white xl:text-5xl">
          Reach India&apos;s
          <br />
          <span className="text-gradient-ig">top creators.</span>
        </h2>
        <p className="max-w-sm leading-relaxed text-muted-foreground dark:text-white/50">
          Post campaigns, review bids, and launch influencer partnerships with full confidence —
          all in one platform.
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

      {/* Social proof */}
      <div
        className={cn(
          "rounded-2xl p-5",
          "bg-muted/50 border border-border/50",
          "dark:glass dark:border-white/10",
        )}
      >
        <p className="mb-3 text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70 dark:text-white/35">
          Trusted by brands including
        </p>
        <div className="flex flex-wrap gap-3">
          {trustedBrands.map((brand) => (
            <span
              key={brand}
              className="rounded-lg border border-border/60 px-3 py-1 text-xs font-semibold text-muted-foreground dark:border-white/10 dark:text-white/50"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
