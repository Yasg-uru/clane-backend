"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  Gavel,
  Handshake,
  IndianRupee,
  ShieldCheck,
  ArrowRight,
  Compass,
  Sparkles,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { GradientOrb } from "@/components/common/gradient-orb";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { CreatorProfileChecklist } from "@/components/dashboard/creator-profile-checklist";
import type { ChecklistItem } from "@/components/dashboard/creator-profile-checklist";
import { CampaignPreviewCard } from "@/components/campaign/campaign-preview-card";
import type { SafeCreator } from "@/types";
import { useBrowseCampaigns } from "@/hooks/campaign/useCampaigns";
import { ROUTES } from "@/config/routes.config";
import { formatCurrency, formatDeadline } from "@/lib/formatters";
import { CampaignPlatform } from "@/types/campaign.types";
import { cn } from "@/lib/utils";

type CreatorDashboardProps = {
  creator: SafeCreator;
};

export function CreatorDashboard({ creator }: CreatorDashboardProps): ReactElement {
  const firstName = creator.fullName.split(" ")[0];
  const score = creator.instagramAuthenticityScore ?? 0;
  const { data: campaignsData } = useBrowseCampaigns({ limit: 3 });

  const initials = creator.fullName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  const checklistItems: ChecklistItem[] = [
    {
      id: "instagram",
      label: "Connect Instagram",
      done: Boolean(creator.instagramHandle),
      cta: "Connect now",
      href: ROUTES.creator.settings,
      icon: <FaInstagram className="size-3.5" />,
    },
    {
      id: "youtube",
      label: "Connect YouTube",
      done: creator.youtubeConnected,
      cta: "Connect now",
      href: ROUTES.creator.settings,
      icon: <FaYoutube className="size-3.5" />,
    },
    {
      id: "score",
      label: "Authenticity score computed",
      done: typeof creator.instagramAuthenticityScore === "number",
      cta: "Sync Instagram",
      href: ROUTES.creator.settings,
      icon: <ShieldCheck className="size-3.5" />,
    },
  ];

  return (
    <div className="relative space-y-6">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="via" className="-right-40 -top-20 h-[600px] w-[600px] opacity-[0.06] blur-[140px] animate-pulse-glow" />
        <GradientOrb color="from" className="-bottom-32 left-0 h-[500px] w-[500px] opacity-[0.05] blur-[120px] animate-pulse-glow delay-neg-2s" />
      </div>

      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 md:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.06]" />
          <div className="absolute inset-0 hero-grid-overlay rounded-3xl opacity-[0.05]" />
          <GradientOrb color="via" className="-right-16 -top-12 h-[280px] w-[280px] opacity-[0.20] blur-[80px] animate-pulse-glow" />
          <GradientOrb color="from" className="-bottom-10 left-1/3 h-[200px] w-[200px] opacity-[0.10] blur-[60px]" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <div className="shrink-0 ring-gradient-ig rounded-full shadow-xl shadow-black/30">
              <div className="flex size-[68px] items-center justify-center rounded-full bg-card text-xl font-bold text-foreground select-none border border-white/5">
                {initials}
              </div>
            </div>

            <div className="space-y-2 pt-1 min-w-0">
              <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
                <Sparkles className="mr-1 size-3" />
                Creator Account
              </Badge>
              <h1 className="text-3xl font-bold text-foreground md:text-4xl leading-none">
                Hey, <span className="text-gradient-ig-anim">{firstName}</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Brands are looking for creators just like you. Complete your profile to get discovered and start earning.
              </p>
              {creator.niche.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {creator.niche.map((n) => (
                    <Badge key={n} variant="secondary" className="text-[11px] bg-white/5 border border-white/10 text-muted-foreground">
                      {n}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href={ROUTES.creator.discover}
              className={cn(buttonVariants({ size: "lg" }), "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90 shadow-lg shadow-black/20")}
            >
              <Compass className="size-4" />
              Browse Campaigns
            </Link>
            <Link
              href={ROUTES.creator.settings}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 border-white/15 hover:bg-white/5 hover:border-white/25")}
            >
              Complete Profile
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats row */}
      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
          Your Overview
        </p>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DashboardStatCard
            icon={<Gavel className="size-5 text-white" />}
            label="Bids Submitted"
            value="0"
            sub="Start bidding on campaigns"
            accentClass="bg-gradient-ig"
            iconBgClass="bg-gradient-ig text-white"
            glowClass="bg-gradient-ig"
          />
          <DashboardStatCard
            icon={<Handshake className="size-5 text-emerald-400" />}
            label="Active Collabs"
            value="0"
            sub="No active collaborations yet"
            accentClass="bg-emerald-500"
            iconBgClass="bg-emerald-500/10 text-emerald-400"
            glowClass="bg-emerald-400"
          />
          <DashboardStatCard
            icon={<IndianRupee className="size-5 text-amber-400" />}
            label="Total Earnings"
            value="₹0"
            sub="Payments via Razorpay"
            accentClass="bg-amber-500"
            iconBgClass="bg-amber-500/10 text-amber-400"
            glowClass="bg-amber-400"
          />
          <DashboardStatCard
            icon={<ShieldCheck className="size-5 text-blue-400" />}
            label="Authenticity Score"
            value={score > 0 ? `${score}` : "—"}
            sub={score > 0 ? "Instagram verified" : "Connect Instagram to compute"}
            accentClass="bg-blue-500"
            iconBgClass="bg-blue-500/10 text-blue-400"
            glowClass="bg-blue-400"
          />
        </div>
      </section>

      <CreatorProfileChecklist items={checklistItems} />

      {/* Matched campaigns */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Campaigns Matched for You</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Based on your niche and follower range — filtered just for you.
            </p>
          </div>
          <Link
            href={ROUTES.creator.discover}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground hover:text-foreground text-xs")}
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(campaignsData?.items ?? []).map((campaign) => {
            const { text: deadlineText } = formatDeadline(campaign.deadline);
            return (
              <CampaignPreviewCard
                key={campaign._id}
                brand={campaign.brandName}
                title={campaign.title}
                niche={campaign.niche}
                budget={formatCurrency(campaign.budgetAmount)}
                deadline={deadlineText}
                platform={campaign.platform === CampaignPlatform.YOUTUBE ? "YouTube" : "Instagram"}
                bids={campaign.totalBids}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
