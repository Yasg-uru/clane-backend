import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowRight, Rocket, Sparkles } from "lucide-react";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

export function LandingCta(): ReactElement {
  return (
    <section className="dark relative overflow-hidden py-24 md:py-32">
      {/* Animated gradient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-ig-animated opacity-90"
      />
      {/* Dark overlay for readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-hero-bg/40"
      />
      {/* Grid overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07] hero-grid-overlay"
      />

      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute -left-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-40 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section label */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Ready to Start?
          </p>
          <h2 className="mb-5 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Your next campaign is
            <br />
            one click away
          </h2>
          <p className="mx-auto max-w-lg text-white/65">
            Join thousands of brands and creators already building successful partnerships on
            CreatorLane.
          </p>
        </div>

        {/* Two CTA cards */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Brand card */}
          <div className="flex flex-col justify-between gap-8 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm md:p-10">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white/20">
                <Rocket className="size-6 text-white" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
                For Brands
              </p>
              <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                Launch your first campaign
              </h3>
              <p className="leading-relaxed text-white/65">
                Post for free. Receive bids within hours. Only pay when you find the perfect creator
                for your brand.
              </p>
            </div>
            <Link
              href={ROUTES.auth.registerBrand}
              className={cn(
                "inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-ig-purple",
                "transition-all hover:bg-white/90 hover:shadow-xl hover:shadow-white/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
              )}
            >
              Start as a Brand
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {/* Creator card */}
          <div className="flex flex-col justify-between gap-8 rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm md:p-10">
            <div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white/20">
                <Sparkles className="size-6 text-white" />
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">
                For Creators
              </p>
              <h3 className="mb-3 text-2xl font-bold text-white md:text-3xl">
                Turn followers into income
              </h3>
              <p className="leading-relaxed text-white/65">
                Browse campaigns, bid on your terms, and get paid securely through escrow. No
                middlemen, no waiting.
              </p>
            </div>
            <Link
              href={ROUTES.auth.registerCreator}
              className={cn(
                "inline-flex h-11 w-fit items-center gap-2 rounded-xl border border-white/40 px-6 text-sm font-semibold text-white",
                "transition-all hover:bg-white/15 hover:border-white/60",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30",
              )}
            >
              Join as a Creator
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
