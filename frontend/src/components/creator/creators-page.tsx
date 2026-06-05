"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Users,
  Search,
  Star,
  MapPin,
  TrendingUp,
  Filter,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GradientOrb } from "@/components/common/gradient-orb";
import { useCreators } from "@/hooks/creator/useCreators";
import { CREATOR_NICHE_FILTER_OPTIONS } from "@/config/creator.config";
import { formatFollowers } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CreatorBrowseItem } from "@/types/creator.types";
import { CreatorPlatform } from "@/types/creator.types";

type CreatorCardProps = { creator: CreatorBrowseItem };

function CreatorCard({ creator }: CreatorCardProps): ReactElement {
  const initials = creator.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
  const score = creator.instagramAuthenticityScore ?? creator.youtubeAuthenticityScore;
  const scoreColor =
    score !== undefined && score >= 90
      ? "text-emerald-500"
      : score !== undefined && score >= 80
      ? "text-amber-500"
      : "text-muted-foreground";
  const engagementRate = creator.instagramEngagementRate ?? creator.youtubeEngagementRate;
  const avgViews = creator.instagramAvgLikes ?? creator.youtubeAvgViews;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-lg hover:border-border/90 hover:-translate-y-0.5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-0 group-hover:opacity-[0.03] transition-opacity"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="ring-gradient-ig rounded-full p-[2px] shrink-0">
            <Avatar className="size-11">
              {creator.instagramProfilePicUrl && (
                <AvatarImage
                  src={creator.instagramProfilePicUrl}
                  alt={creator.fullName}
                />
              )}
              <AvatarFallback className="text-xs font-bold bg-muted">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {creator.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {creator.instagramHandle}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="size-2.5 text-muted-foreground/60 shrink-0" />
              <span className="text-[10px] text-muted-foreground/60">
                {creator.city}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 rounded-lg bg-muted/80 px-2 py-1">
          {creator.platform === CreatorPlatform.BOTH ? (
            <span className="flex gap-0.5">
              <FaInstagram className="size-3 text-muted-foreground" />
              <FaYoutube className="size-3 text-muted-foreground" />
            </span>
          ) : creator.platform === CreatorPlatform.YOUTUBE ? (
            <FaYoutube className="size-3 text-muted-foreground" />
          ) : (
            <FaInstagram className="size-3 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-base font-bold text-foreground leading-none">
            {formatFollowers(creator.instagramFollowers)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">followers</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-base font-bold text-foreground leading-none">
            {engagementRate?.toFixed(1) ?? "—"}%
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">engagement</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-base font-bold text-foreground leading-none">
            {avgViews ? formatFollowers(avgViews) : "—"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">avg views</p>
        </div>
      </div>

      {/* Niches */}
      <div className="mt-3 flex flex-wrap gap-1">
        {creator.niche.slice(0, 3).map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[10px] px-2 py-0.5 rounded-full"
          >
            {tag}
          </Badge>
        ))}
      </div>

      {/* Authenticity score */}
      {score !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/40 px-3 py-2">
          <Star className={cn("size-3.5 fill-current shrink-0", scoreColor)} />
          <span className={cn("text-xs font-bold", scoreColor)}>{score}</span>
          <span className="text-[11px] text-muted-foreground">/ 100 authenticity</span>
        </div>
      )}
    </div>
  );
}

function CreatorCardSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-12 rounded-xl" />
        ))}
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 rounded-xl" />
    </div>
  );
}

export function CreatorsPage(): ReactElement {
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [sortBy, setSortBy] = useState<"followers" | "engagement" | "score">(
    "followers",
  );

  const { data, isLoading } = useCreators({
    niche: selectedNiche !== "All" ? [selectedNiche] : undefined,
    limit: 50,
  });

  const creators = data?.items ?? [];

  const filtered = creators
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.instagramHandle.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === "followers") return b.instagramFollowers - a.instagramFollowers;
      if (sortBy === "engagement")
        return (
          (b.instagramEngagementRate ?? b.youtubeEngagementRate ?? 0) -
          (a.instagramEngagementRate ?? a.youtubeEngagementRate ?? 0)
        );
      return (
        (b.instagramAuthenticityScore ?? b.youtubeAuthenticityScore ?? 0) -
        (a.instagramAuthenticityScore ?? a.youtubeAuthenticityScore ?? 0)
      );
    });

  const totalCount = data?.pagination.total ?? 0;

  return (
    <div className="relative space-y-8">
      {/* Ambient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <GradientOrb
          color="from"
          className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]"
        />
        <GradientOrb
          color="to"
          className="-bottom-32 right-0 h-[400px] w-[400px] opacity-[0.04] blur-[110px]"
        />
      </div>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 md:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb
            color="from"
            className="-right-20 -top-16 h-[280px] w-[280px] opacity-[0.10] blur-[70px]"
          />
        </div>
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
                <Sparkles className="mr-1 size-3" />
                Creator Marketplace
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Browse Creators</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Discover verified influencers with real audiences. Filter by niche,
              platform, and authenticity score.
            </p>
          </div>
          {!isLoading && (
            <div className="flex items-center gap-3 shrink-0">
              <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-foreground">{totalCount}+</p>
                <p className="text-xs text-muted-foreground">verified creators</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, handle or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
              <Filter className="size-3.5" />
              {selectedNiche}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {CREATOR_NICHE_FILTER_OPTIONS.map((niche) => (
                <DropdownMenuItem
                  key={niche}
                  onClick={() => setSelectedNiche(niche)}
                >
                  {niche}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
              <TrendingUp className="size-3.5" />
              Sort:{" "}
              {sortBy === "score"
                ? "Top Score"
                : sortBy === "followers"
                ? "Followers"
                : "Engagement"}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("followers")}>
                Most Followers
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("engagement")}>
                Highest Engagement
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("score")}>
                Top Authenticity Score
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      {/* Results */}
      <section>
        {!isLoading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              creators
            </p>
            <div className="flex items-center gap-1">
              <Users className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Verified &amp; scored
              </span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CreatorCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
            <Users className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No creators found
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Try adjusting your search or filters
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearch("");
                setSelectedNiche("All");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
