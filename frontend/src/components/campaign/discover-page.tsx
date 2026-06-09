"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Compass,
  Search,
  Calendar,
  Megaphone,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GradientOrb } from "@/components/common/gradient-orb";
import { PageHero } from "@/components/common/page-hero";
import { EmptyState } from "@/components/common/empty-state";
import {
  DiscoverCampaignCard,
  DiscoverCampaignCardSkeleton,
} from "@/components/campaign/discover-campaign-card";
import { BidForm } from "@/components/bid/bid-form";
import { useBrowseCampaigns } from "@/hooks/campaign/useCampaigns";
import type { CampaignBrowseItem, CampaignBrowseFilters } from "@/types/creator.types";
import { CampaignPlatform } from "@/types/campaign.types";
import { NICHE_OPTIONS } from "@/config/campaign.config";

export function DiscoverPage(): ReactElement {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CampaignBrowseFilters>({ page: 1, limit: 12 });
  const [bidTarget, setBidTarget] = useState<CampaignBrowseItem | null>(null);

  const { data, isLoading } = useBrowseCampaigns(filters);
  const campaigns = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filteredCampaigns = search
    ? campaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.brandName.toLowerCase().includes(search.toLowerCase()) ||
          c.niche.some((n) => n.toLowerCase().includes(search.toLowerCase())),
      )
    : campaigns;

  const hasActiveFilters = Boolean(filters.platform || filters.niche?.length);

  function handleNicheSelect(niche: string | undefined): void {
    setFilters((prev) => ({ ...prev, niche: niche ? [niche] : undefined, page: 1 }));
  }

  function handlePlatformSelect(platform: CampaignPlatform | undefined): void {
    setFilters((prev) => ({ ...prev, platform, page: 1 }));
  }

  function clearFilters(): void {
    setFilters({ page: 1, limit: 12 });
  }

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
        <GradientOrb color="to" className="-bottom-32 right-0 h-[400px] w-[400px] opacity-[0.04] blur-[110px]" />
      </div>

      <PageHero
        badge="Campaign Marketplace"
        title="Discover Campaigns"
        subtitle="Browse brand campaigns that match your niche and audience. Submit bids and start collaborating."
        stats={[{ value: data?.total ?? "—", label: "open campaigns" }]}
      />

      <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns, brands, niches…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
              <Filter className="size-3.5" />
              {filters.platform ? (
                <span className="capitalize">{filters.platform}</span>
              ) : (
                "Platform"
              )}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePlatformSelect(undefined)}>All Platforms</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePlatformSelect(CampaignPlatform.INSTAGRAM)}>Instagram</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePlatformSelect(CampaignPlatform.YOUTUBE)}>YouTube</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePlatformSelect(CampaignPlatform.BOTH)}>Both</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground">
              <Megaphone className="size-3.5" />
              {filters.niche?.[0] ?? "Niche"}
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
              <DropdownMenuItem onClick={() => handleNicheSelect(undefined)}>All Niches</DropdownMenuItem>
              {NICHE_OPTIONS.map((n) => (
                <DropdownMenuItem key={n} onClick={() => handleNicheSelect(n)}>{n}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={clearFilters}>
              <X className="size-3.5" />
              Clear
            </Button>
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{filteredCampaigns.length}</span>{" "}
            campaigns
          </p>
          <div className="flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sorted by latest</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <DiscoverCampaignCardSkeleton key={i} />)}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <EmptyState
            icon={<Compass className="size-10" />}
            title="No campaigns found"
            subtitle="Try adjusting your filters or check back later for new campaigns."
            action={
              hasActiveFilters ? (
                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <DiscoverCampaignCard key={campaign._id} campaign={campaign} onBid={setBidTarget} />
            ))}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!filters.page || filters.page <= 1}
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            {filters.page ?? 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={(filters.page ?? 1) >= totalPages}
            onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}

      {bidTarget && (
        <Dialog open={Boolean(bidTarget)} onOpenChange={(v) => !v && setBidTarget(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Submit Bid</DialogTitle>
            </DialogHeader>
            <BidForm
              campaign={bidTarget}
              onSuccess={() => setBidTarget(null)}
              onCancel={() => setBidTarget(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
