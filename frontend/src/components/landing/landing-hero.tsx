import type { ReactElement, ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, TrendingUp, Users, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

/* ── Floating creator profile card ───────────────────────── */

type FloatingCardProps = {
  name: string;
  handle: string;
  followers: string;
  platform: string;
  engagementLabel: string;
  className?: string;
  floatClass?: string;
};

function FloatingCard({
  name,
  handle,
  followers,
  platform,
  engagementLabel,
  className,
  floatClass = "animate-float",
}: FloatingCardProps): ReactElement {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute hidden xl:flex flex-col gap-3 rounded-2xl p-4 z-10 w-44",
        "bg-card/90 border border-border/60 shadow-xl backdrop-blur-sm",
        "dark:glass dark:border-white/10 dark:shadow-2xl",
        floatClass,
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="ring-gradient-ig rounded-full shrink-0">
          <Avatar className="size-8">
            <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground dark:bg-hero-surface dark:text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground dark:text-white">{name}</p>
          <p className="truncate text-[10px] text-muted-foreground dark:text-white/50">{handle}</p>
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold leading-none text-foreground dark:text-white">{followers}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground dark:text-white/50">followers</p>
      </div>

      <div className="flex items-center justify-between">
        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-white/10 dark:text-white/70">
          {platform}
        </span>
        <span className="text-[10px] text-ig-orange font-semibold">{engagementLabel}</span>
      </div>
    </div>
  );
}

/* ── Story-ring stat card ─────────────────────────────────── */

type StatCardProps = {
  icon: ReactNode;
  value: string;
  label: string;
  delay?: string;
};

function StatCard({ icon, value, label, delay = "" }: StatCardProps): ReactElement {
  return (
    <div className={cn("flex flex-col items-center gap-2 animate-fade-up", delay)}>
      <div className="ring-gradient-ig rounded-full p-[2.5px] animate-ping-slow">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted text-foreground dark:bg-hero-bg dark:text-white">
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-foreground dark:text-white">{value}</p>
      <p className="text-[11px] text-muted-foreground text-center leading-tight dark:text-white/50">{label}</p>
    </div>
  );
}

/* ── Hero section ─────────────────────────────────────────── */

export function LandingHero(): ReactElement {
  return (
    <section className="relative min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-background pt-24 pb-20">

      {/* ── Animated gradient blobs (more subtle in light mode) ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full bg-ig-purple/10 blur-[120px] animate-pulse-glow dark:bg-ig-purple/20" />
        <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full bg-ig-orange/8 blur-[100px] animate-pulse-glow delay-neg-2s dark:bg-ig-orange/15" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ig-red/6 blur-[80px] dark:bg-ig-red/10" />
        <div className="absolute inset-0 opacity-[0.05] adaptive-grid-overlay dark:opacity-[0.06] dark:hero-grid-overlay" />
      </div>

      {/* ── Floating creator cards ── */}
      <FloatingCard
        name="Priya Sharma"
        handle="@priya.creates"
        followers="180K"
        platform="Instagram"
        engagementLabel="8.2% eng"
        className="top-[22%] left-[3%]"
        floatClass="animate-float"
      />
      <FloatingCard
        name="Arjun Tech"
        handle="@arjun.tech"
        followers="220K"
        platform="YouTube"
        engagementLabel="6.7% eng"
        className="top-[18%] right-[3%]"
        floatClass="animate-float-b"
      />
      <FloatingCard
        name="Sneha Verma"
        handle="@sneha.eats"
        followers="95K"
        platform="Instagram"
        engagementLabel="11.4% eng"
        className="bottom-[22%] right-[5%]"
        floatClass="animate-float-c"
      />

      {/* ── Main content ── */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm animate-fade-up dark:border-white/10 dark:bg-white/5 dark:text-white/80">
          <Zap className="size-3.5 text-ig-orange" />
          India&apos;s Creator Economy Platform
          <span className="ml-1 rounded-full bg-gradient-ig px-2 py-0.5 text-[10px] font-bold text-white">
            NEW
          </span>
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-[1.05] tracking-tight text-foreground dark:text-white md:text-7xl animate-fade-up delay-100">
          Where Brands Meet
          <br />
          <span className="text-gradient-ig-anim">Real Creators</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg animate-fade-up delay-200">
          Post campaigns. Receive bids from verified creators. Deliver results — all with payments
          secured by escrow.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-up delay-300">
          <Link
            href={ROUTES.auth.registerBrand}
            className="inline-flex h-11 items-center gap-2 rounded-xl px-8 text-sm font-semibold text-white bg-gradient-ig-animated shadow-lg transition-all hover:scale-[1.02] hover:shadow-ig-purple/30 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            I&apos;m a Brand
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={ROUTES.auth.registerCreator}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-8 text-sm font-semibold text-foreground transition-all hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 dark:border-white/20 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white dark:hover:border-white/30"
          >
            I&apos;m a Creator
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="relative z-10 mt-20 flex items-start justify-center gap-12 px-6 sm:gap-16 animate-fade-up delay-500">
        <StatCard icon={<Briefcase className="size-5" />} value="500+" label="Active Campaigns" delay="delay-500" />
        <div className="mt-2 h-10 w-px bg-border dark:bg-white/10" />
        <StatCard icon={<Users className="size-5" />} value="10K+" label="Verified Creators" delay="delay-700" />
        <div className="mt-2 h-10 w-px bg-border dark:bg-white/10" />
        <StatCard icon={<TrendingUp className="size-5" />} value="₹2Cr+" label="Creator Earnings" delay="delay-1000" />
      </div>

      {/* ── Bottom fade into next section ── */}
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
