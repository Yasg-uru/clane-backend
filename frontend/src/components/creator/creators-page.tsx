"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Users,
  Search,
  TrendingUp,
  Filter,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GradientOrb } from "@/components/common/gradient-orb";
import { PageHero } from "@/components/common/page-hero";
import { EmptyState } from "@/components/common/empty-state";
import { CreatorCard, CreatorCardSkeleton } from "@/components/creator/creator-card";
import { useCreators } from "@/hooks/creator/useCreators";
import { CREATOR_NICHE_FILTER_OPTIONS } from "@/config/creator.config";

export function CreatorsPage(): ReactElement {
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("All");
  const [sortBy, setSortBy] = useState<"followers" | "engagement" | "score">("followers");

  const { data, isLoading } = useCreators({
    niche: selectedNiche !== "All" ? [selectedNiche] : undefined,
    limit: 50,
  });

  const creators = data?.items ?? [];
  const totalCount = data?.pagination.total ?? 0;

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

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
        <GradientOrb color="to" className="-bottom-32 right-0 h-[400px] w-[400px] opacity-[0.04] blur-[110px]" />
      </div>

      <PageHero
        badge="Creator Marketplace"
        title="Browse Creators"
        subtitle="Discover verified influencers with real audiences. Filter by niche, platform, and authenticity score."
        stats={[{ value: `${totalCount}+`, label: "verified creators", hidden: isLoading }]}
      />

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
                <DropdownMenuItem key={niche} onClick={() => setSelectedNiche(niche)}>
                  {niche}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
              <TrendingUp className="size-3.5" />
              Sort:{" "}
              {sortBy === "score" ? "Top Score" : sortBy === "followers" ? "Followers" : "Engagement"}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("followers")}>Most Followers</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("engagement")}>Highest Engagement</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("score")}>Top Authenticity Score</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <section>
        {!isLoading && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filtered.length}</span> creators
            </p>
            <div className="flex items-center gap-1">
              <Users className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Verified &amp; scored</span>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <CreatorCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="size-10" />}
            title="No creators found"
            subtitle="Try adjusting your search or filters"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(""); setSelectedNiche("All"); }}
              >
                Clear filters
              </Button>
            }
          />
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
