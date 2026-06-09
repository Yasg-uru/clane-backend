"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  Megaphone,
  Gavel,
  Handshake,
  IndianRupee,
  ArrowRight,
  Users,
  Sparkles,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { GradientOrb } from "@/components/common/gradient-orb";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { CreatorPreviewCard } from "@/components/creator/creator-preview-card";
import type { SafeBrand } from "@/types";
import { HOW_IT_WORKS } from "@/config/brand.config";
import { useCreators } from "@/hooks/creator/useCreators";
import { ROUTES } from "@/config/routes.config";
import { formatFollowers, getInitials } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { CreatorPlatform } from "@/types/creator.types";

type BrandDashboardProps = {
  brand: SafeBrand;
};

export function BrandDashboard({ brand }: BrandDashboardProps): ReactElement {
  const firstName = brand.brandName.split(" ")[0];
  const { data: creatorsData, isLoading: creatorsLoading } = useCreators({ limit: 10 });

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[600px] w-[600px] opacity-[0.06] blur-[140px] animate-pulse-glow" />
        <GradientOrb color="to" className="-bottom-32 right-0 h-[500px] w-[500px] opacity-[0.05] blur-[120px] animate-pulse-glow delay-neg-2s" />
      </div>

      {/* Welcome banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 md:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb color="from" className="-right-20 -top-16 h-[300px] w-[300px] opacity-[0.12] blur-[80px] animate-pulse-glow" />
          <GradientOrb color="to" className="-bottom-12 left-1/3 h-[220px] w-[220px] opacity-[0.08] blur-[60px]" />
          <div className="absolute inset-0 opacity-[0.03] adaptive-grid-overlay rounded-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
              <Sparkles className="mr-1 size-3" />
              Brand Account
            </Badge>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Welcome back,{" "}
              <span className="text-gradient-ig">{firstName}</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md">
              Your creator marketplace is ready. Launch a campaign and start reaching the right audience.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.brand.campaignCreate}
              className={cn(buttonVariants({ size: "lg" }), "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90 shadow-lg")}
            >
              <Plus className="size-4" />
              New Campaign
            </Link>
            <Link
              href={ROUTES.brand.creators}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              <Users className="size-4" />
              Browse Creators
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <DashboardStatCard
            icon={<Megaphone className="size-5" />}
            label="Active Campaigns"
            value="0"
            sub="None yet — create one now"
            accentClass="bg-gradient-ig"
            iconBgClass="bg-gradient-ig text-white"
          />
          <DashboardStatCard
            icon={<Gavel className="size-5" />}
            label="Bids Received"
            value="0"
            sub="Waiting for your first campaign"
            accentClass="bg-blue-500"
            iconBgClass="bg-blue-500/10 text-blue-500"
          />
          <DashboardStatCard
            icon={<Handshake className="size-5" />}
            label="Ongoing Collabs"
            value="0"
            sub="No active collaborations yet"
            accentClass="bg-emerald-500"
            iconBgClass="bg-emerald-500/10 text-emerald-500"
          />
          <DashboardStatCard
            icon={<IndianRupee className="size-5" />}
            label="Total Spent"
            value="₹0"
            sub="Secured via escrow"
            accentClass="bg-amber-500"
            iconBgClass="bg-amber-500/10 text-amber-500"
          />
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">How CreatorLane works</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">From idea to collab in 3 steps</p>
          </div>
          <Badge variant="secondary" className="text-xs">3 steps</Badge>
        </div>

        <div className="relative hidden md:grid md:grid-cols-3 md:gap-8" style={{ minHeight: "260px" }}>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            viewBox="0 0 600 260"
            preserveAspectRatio="none"
            fill="none"
          >
            <defs>
              <linearGradient id="howItWorksPathGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                <stop offset="0%" stopColor="var(--grad-from)" stopOpacity="0.6" />
                <stop offset="50%" stopColor="var(--grad-via)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--grad-to)" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              d="M 100 36 C 200 36, 200 132, 300 132 C 400 132, 400 36, 500 36"
              stroke="url(#howItWorksPathGrad)"
              strokeWidth="2.5"
              strokeDasharray="10 7"
              strokeLinecap="round"
              style={{ animation: "dash-flow 1.2s linear infinite" }}
            />
          </svg>

          {HOW_IT_WORKS.map((step, idx) => (
            <div key={step.step} className={cn("relative z-10 flex flex-col items-center text-center", idx === 1 && "mt-24")}>
              <div className="relative flex size-[72px] items-center justify-center rounded-full bg-gradient-ig text-white shadow-xl ring-4 ring-background">
                <step.Icon className="size-7" />
                <span className="absolute -right-1 -top-1 flex size-[22px] items-center justify-center rounded-full border-2 border-background bg-foreground text-[10px] font-bold text-background shadow-sm">
                  {idx + 1}
                </span>
              </div>
              <div className="mt-5 max-w-[180px] space-y-1.5">
                <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden">
          {HOW_IT_WORKS.map((step, idx) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-ig text-white shadow-md ring-2 ring-background">
                  <step.Icon className="size-5" />
                  <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full border-2 border-background bg-foreground text-[9px] font-bold text-background">
                    {idx + 1}
                  </span>
                </div>
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="my-1.5 w-0.5 flex-1 bg-gradient-to-b from-border to-border/10" style={{ minHeight: "36px" }} />
                )}
              </div>
              <div className={cn("pb-7 pt-2", idx === HOW_IT_WORKS.length - 1 && "pb-0")}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">Step {idx + 1}</p>
                <h3 className="mt-0.5 text-sm font-bold text-foreground">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore creators */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Explore Creators</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Verified, scored, and ready to collab.</p>
          </div>
          <Link
            href={ROUTES.brand.creators}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground")}
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {creatorsLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-8 rounded" />
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-8 rounded-xl" />
                </div>
              ))
            : (creatorsData?.items ?? []).map((creator) => (
                <CreatorPreviewCard
                  key={creator.id}
                  name={creator.fullName}
                  handle={creator.instagramHandle}
                  niche={creator.niche}
                  followers={formatFollowers(creator.instagramFollowers)}
                  platform={creator.platform === CreatorPlatform.YOUTUBE ? "YouTube" : "Instagram"}
                  score={creator.instagramAuthenticityScore ?? creator.youtubeAuthenticityScore ?? 0}
                  initials={getInitials(creator.fullName)}
                />
              ))}
        </div>
      </section>
    </div>
  );
}
