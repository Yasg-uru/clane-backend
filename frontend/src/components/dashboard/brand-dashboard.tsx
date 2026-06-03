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
  Star,
  Plus,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { GradientOrb } from "@/components/common/gradient-orb";
import type { SafeBrand } from "@/types";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

type BrandDashboardProps = {
  brand: SafeBrand;
};

type StatCardProps = {
  icon: ReactElement;
  label: string;
  value: string;
  sub?: string;
  gradient?: boolean;
};

function StatCard({ icon, label, value, sub, gradient }: StatCardProps): ReactElement {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md",
        gradient && "border-transparent",
      )}
    >
      {gradient && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.07]"
        />
      )}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            gradient
              ? "bg-gradient-ig text-white"
              : "bg-muted text-muted-foreground",
          )}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create a Campaign",
    desc: "Set your budget, niche, and deliverables. Go live in minutes.",
    icon: <Megaphone className="size-5" />,
  },
  {
    step: "02",
    title: "Receive Bids",
    desc: "Verified creators pitch their ideas and rates directly to you.",
    icon: <Gavel className="size-5" />,
  },
  {
    step: "03",
    title: "Pick a Creator",
    desc: "Review profiles, authenticity scores, and past work. Choose the best fit.",
    icon: <Users className="size-5" />,
  },
] as const;

const MOCK_CREATORS = [
  {
    name: "Priya Sharma",
    handle: "@priya.creates",
    niche: ["Fashion", "Lifestyle"],
    followers: "180K",
    platform: "Instagram" as const,
    score: 94,
    initials: "PS",
  },
  {
    name: "Arjun Tech",
    handle: "@arjun.tech",
    niche: ["Tech", "Reviews"],
    followers: "220K",
    platform: "YouTube" as const,
    score: 91,
    initials: "AT",
  },
  {
    name: "Sneha Verma",
    handle: "@sneha.eats",
    niche: ["Food", "Travel"],
    followers: "95K",
    platform: "Instagram" as const,
    score: 97,
    initials: "SV",
  },
  {
    name: "Rahul Fitness",
    handle: "@rahul.fit",
    niche: ["Fitness", "Health"],
    followers: "310K",
    platform: "YouTube" as const,
    score: 88,
    initials: "RF",
  },
] as const;

export function BrandDashboard({ brand }: BrandDashboardProps): ReactElement {
  const firstName = brand.brandName.split(" ")[0];

  return (
    <div className="relative space-y-8">
      {/* ── Ambient background ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb
          color="from"
          className="-left-40 -top-20 h-[600px] w-[600px] opacity-[0.06] blur-[140px] animate-pulse-glow"
        />
        <GradientOrb
          color="to"
          className="-bottom-32 right-0 h-[500px] w-[500px] opacity-[0.05] blur-[120px] animate-pulse-glow delay-neg-2s"
        />
      </div>

      {/* ── Welcome banner ── */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-8 md:p-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb
            color="from"
            className="-right-20 -top-16 h-[300px] w-[300px] opacity-[0.12] blur-[80px] animate-pulse-glow"
          />
          <GradientOrb
            color="to"
            className="-bottom-12 left-1/3 h-[220px] w-[220px] opacity-[0.08] blur-[60px]"
          />
          <div className="absolute inset-0 opacity-[0.03] adaptive-grid-overlay rounded-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
                <Sparkles className="mr-1 size-3" />
                Brand Account
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              Welcome back,{" "}
              <span className="text-gradient-ig">{firstName}</span>
            </h1>
            <p className="text-base text-muted-foreground max-w-md">
              Your creator marketplace is ready. Launch your first campaign and start reaching the right audience.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              href={ROUTES.brand.campaigns}
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90 shadow-lg",
              )}
            >
              <Plus className="size-4" />
              Create Campaign
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

      {/* ── Stats row ── */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Overview
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Megaphone className="size-5" />}
            label="Active Campaigns"
            value="0"
            sub="None yet — create one now"
            gradient
          />
          <StatCard
            icon={<Gavel className="size-5" />}
            label="Total Bids Received"
            value="0"
            sub="Waiting for your first campaign"
          />
          <StatCard
            icon={<Handshake className="size-5" />}
            label="Ongoing Collabs"
            value="0"
            sub="No active collaborations yet"
          />
          <StatCard
            icon={<IndianRupee className="size-5" />}
            label="Total Spent"
            value="₹0"
            sub="All payments secured via escrow"
          />
        </div>
      </section>

      {/* ── Create campaign CTA card ── */}
      <section>
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-border/70 bg-card/50 p-8 text-center transition-colors hover:border-border">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.03]" />
          </div>
          <div className="relative z-10 mx-auto max-w-sm space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-ig text-white shadow-lg">
              <Megaphone className="size-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Launch your first campaign</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Set your niche, budget, and requirements. Creators will bid within hours.
              </p>
            </div>
            <Link
              href={ROUTES.brand.campaigns}
              className={cn(
                buttonVariants(),
                "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90",
              )}
            >
              Get started
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">How CreatorLane works</h2>
          <Badge variant="secondary" className="text-xs">
            3 simple steps
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((step, idx) => (
            <div
              key={step.step}
              className="relative rounded-2xl border border-border/60 bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-ig text-white shadow-sm">
                  {step.icon}
                </div>
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                      Step {step.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </div>
              {idx < HOW_IT_WORKS.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute -right-2 top-1/2 hidden -translate-y-1/2 md:block"
                >
                  <ArrowRight className="size-4 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Explore Creators ── */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Explore Creators</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Get a feel for the talent on CreatorLane — verified, scored, ready to collab.
            </p>
          </div>
          <Link
            href={ROUTES.brand.creators}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "gap-1.5 text-muted-foreground",
            )}
          >
            View all
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_CREATORS.map((creator) => (
            <CreatorPreviewCard key={creator.handle} {...creator} />
          ))}
        </div>
      </section>
    </div>
  );
}

type CreatorPreviewCardProps = {
  name: string;
  handle: string;
  niche: readonly string[];
  followers: string;
  platform: "Instagram" | "YouTube";
  score: number;
  initials: string;
};

function CreatorPreviewCard({
  name,
  handle,
  niche,
  followers,
  platform,
  score,
  initials,
}: CreatorPreviewCardProps): ReactElement {
  const isInstagram = platform === "Instagram";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border">
      <div className="flex items-center gap-3">
        <div className="ring-gradient-ig rounded-full p-[2px] shrink-0">
          <Avatar className="size-10">
            <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{handle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-foreground leading-none">{followers}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">followers</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5">
          {isInstagram ? (
            <FaInstagram className="size-3.5 text-muted-foreground" />
          ) : (
            <FaYoutube className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-[11px] font-medium text-muted-foreground">{platform}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {niche.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-2">
        <Star className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <span className="text-xs font-semibold text-foreground">{score}</span>
        <span className="text-[11px] text-muted-foreground">/ 100 authenticity</span>
      </div>
    </div>
  );
}
