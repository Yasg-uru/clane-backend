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
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { GradientOrb } from "@/components/common/gradient-orb";
import type { SafeCreator } from "@/types";
import { useBrowseCampaigns } from "@/hooks/campaign/useCampaigns";
import { ROUTES } from "@/config/routes.config";
import { formatCurrency, formatDeadline } from "@/lib/formatters";
import { CampaignPlatform } from "@/types/campaign.types";
import { cn } from "@/lib/utils";

type CreatorDashboardProps = {
  creator: SafeCreator;
};

type StatCardProps = {
  icon: ReactElement;
  label: string;
  value: string;
  sub?: string;
  accentClass: string;
  iconBgClass: string;
};

function StatCard({ icon, label, value, sub, accentClass, iconBgClass }: StatCardProps): ReactElement {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border">
      <div className={cn("absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl", accentClass)} />
      <div className="flex items-start justify-between">
        <div className={cn("flex size-10 items-center justify-center rounded-xl", iconBgClass)}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

export function CreatorDashboard({ creator }: CreatorDashboardProps): ReactElement {
  const firstName = creator.fullName.split(" ")[0];
  const score = creator.instagramAuthenticityScore ?? 0;
  const { data: campaignsData } = useBrowseCampaigns({ limit: 3 });

  const completionItems = [
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

  const completedCount = completionItems.filter((i) => i.done).length;
  const completionPct = Math.round((completedCount / completionItems.length) * 100);
  const profileComplete = completionPct === 100;

  return (
    <div className="relative space-y-8">
      {/* ── Ambient background ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb
          color="via"
          className="-right-40 -top-20 h-[600px] w-[600px] opacity-[0.06] blur-[140px] animate-pulse-glow"
        />
        <GradientOrb
          color="from"
          className="-bottom-32 left-0 h-[500px] w-[500px] opacity-[0.05] blur-[120px] animate-pulse-glow delay-neg-2s"
        />
      </div>

      {/* ── Welcome banner ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 md:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb
            color="via"
            className="-right-20 -top-16 h-[300px] w-[300px] opacity-[0.14] blur-[80px] animate-pulse-glow"
          />
          <GradientOrb
            color="from"
            className="-bottom-12 left-1/4 h-[220px] w-[220px] opacity-[0.09] blur-[60px]"
          />
          <div className="absolute inset-0 opacity-[0.03] adaptive-grid-overlay rounded-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
              <Sparkles className="mr-1 size-3" />
              Creator Account
            </Badge>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Hey,{" "}
              <span className="text-gradient-ig">{firstName}</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md">
              Brands are looking for creators just like you. Complete your profile to get discovered and start earning.
            </p>
            {creator.niche.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {creator.niche.map((n) => (
                  <Badge key={n} variant="secondary" className="text-xs">
                    {n}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href={ROUTES.creator.discover}
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90 shadow-lg",
              )}
            >
              <Compass className="size-4" />
              Browse Campaigns
            </Link>
            <Link
              href={ROUTES.creator.settings}
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
            >
              Complete Profile
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Profile completeness ── */}
      {!profileComplete && (
        <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.04]" />
          </div>
          <div className="relative z-10">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground">Profile Completeness</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Brands evaluate your profile before bidding. A complete profile gets 3× more visibility.
                </p>
              </div>
              <div className="shrink-0 ml-4">
                <span className="text-2xl font-bold text-gradient-ig">{completionPct}%</span>
              </div>
            </div>

            <Progress value={completionPct} className="h-2 mb-5" />

            <div className="grid gap-3 sm:grid-cols-3">
              {completionItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3.5 transition-colors",
                    item.done
                      ? "border-border/50 bg-muted/40"
                      : "border-border/80 bg-card",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-lg",
                        item.done
                          ? "bg-gradient-ig text-white"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.done ? <CheckCircle2 className="size-3.5" /> : item.icon}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        item.done ? "text-muted-foreground line-through" : "text-foreground",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {!item.done && (
                    <Link
                      href={item.href}
                      className="flex items-center gap-0.5 text-[11px] font-semibold text-gradient-ig hover:opacity-80 transition-opacity shrink-0 ml-2"
                    >
                      {item.cta}
                      <ChevronRight className="size-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Stats row ── */}
      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Gavel className="size-5" />}
            label="Bids Submitted"
            value="0"
            sub="Start bidding on campaigns"
            accentClass="bg-gradient-ig"
            iconBgClass="bg-gradient-ig text-white"
          />
          <StatCard
            icon={<Handshake className="size-5" />}
            label="Active Collabs"
            value="0"
            sub="No active collaborations yet"
            accentClass="bg-emerald-500"
            iconBgClass="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            icon={<IndianRupee className="size-5" />}
            label="Total Earnings"
            value="₹0"
            sub="Payments via Razorpay"
            accentClass="bg-amber-500"
            iconBgClass="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            icon={<ShieldCheck className="size-5" />}
            label="Authenticity Score"
            value={score > 0 ? `${score}` : "—"}
            sub={score > 0 ? "Instagram verified" : "Connect Instagram to compute"}
            accentClass="bg-blue-500"
            iconBgClass="bg-blue-500/10 text-blue-500"
          />
        </div>
      </section>

      {/* ── Matched Campaigns ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Campaigns Matched for You</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Based on your niche and follower range — filtered just for you.
            </p>
          </div>
          <Link
            href={ROUTES.creator.discover}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 text-muted-foreground",
            )}
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
                platform={
                  campaign.platform === CampaignPlatform.YOUTUBE ? "YouTube" : "Instagram"
                }
                bids={campaign.totalBids}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}

type CampaignPreviewCardProps = {
  brand: string;
  title: string;
  niche: readonly string[];
  budget: string;
  deadline: string;
  platform: "Instagram" | "YouTube";
  bids: number;
};

function CampaignPreviewCard({
  brand,
  title,
  niche,
  budget,
  deadline,
  platform,
  bids,
}: CampaignPreviewCardProps): ReactElement {
  const isInstagram = platform === "Instagram";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border">
      {/* Brand + platform */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">{brand}</p>
        <div className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1">
          {isInstagram ? (
            <FaInstagram className="size-3 text-muted-foreground" />
          ) : (
            <FaYoutube className="size-3 text-muted-foreground" />
          )}
          <span className="text-[10px] font-medium text-muted-foreground">{platform}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1">
        {title}
      </h3>

      {/* Niche tags */}
      <div className="mt-2.5 flex flex-wrap gap-1">
        {niche.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
            {tag}
          </Badge>
        ))}
      </div>

      <Separator className="my-3.5" />

      {/* Meta */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 font-semibold text-foreground">
          <IndianRupee className="size-3.5" />
          {budget}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="size-3" />
          {deadline}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground">{bids} bids so far</span>
        <Link
          href={ROUTES.creator.discover}
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-7 gap-1 bg-gradient-ig text-white border-transparent hover:opacity-90 text-xs px-3",
          )}
        >
          Bid now
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
