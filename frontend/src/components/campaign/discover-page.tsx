"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Compass,
  Search,
  IndianRupee,
  MapPin,
  Calendar,
  Users,
  Megaphone,
  Filter,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Clock,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientOrb } from "@/components/common/gradient-orb";
import { useBrowseCampaigns } from "@/hooks/campaign/useCampaigns";
import { BidForm } from "@/components/bid/bid-form";
import type { CampaignBrowseItem, CampaignBrowseFilters } from "@/types/creator.types";
import { CampaignPlatform, CampaignDeliveryType } from "@/types/campaign.types";
import { NICHE_OPTIONS } from "@/config/campaign.config";
import { formatCurrency, getDaysLeft } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type CampaignCardProps = {
  campaign: CampaignBrowseItem;
  onBid: (campaign: CampaignBrowseItem) => void;
};

function CampaignCard({ campaign, onBid }: CampaignCardProps): ReactElement {
  const daysLeft = getDaysLeft(campaign.deadline);
  const isUrgent = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  const platformIcon = campaign.platform === CampaignPlatform.INSTAGRAM
    ? <FaInstagram className="size-3.5" />
    : campaign.platform === CampaignPlatform.YOUTUBE
    ? <FaYoutube className="size-3.5" />
    : <span className="flex gap-0.5"><FaInstagram className="size-3" /><FaYoutube className="size-3" /></span>;

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5",
      campaign.hasBid ? "border-emerald-500/40" : "border-border/60 hover:border-border/90",
    )}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-0 group-hover:opacity-[0.02] transition-opacity" />

      {/* Has bid badge */}
      {campaign.hasBid && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 border border-emerald-500/30">
          <CheckCircle2 className="size-3 text-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Bid Submitted</span>
        </div>
      )}

      {/* Header */}
      <div className="pr-20">
        <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">{campaign.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{campaign.brandName}</p>
      </div>

      {/* Tags row */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <div className="flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground">
          {platformIcon}
          <span className="capitalize">{campaign.platform}</span>
        </div>
        {campaign.niche.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">{tag}</Badge>
        ))}
        {campaign.niche.length > 2 && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">+{campaign.niche.length - 2}</Badge>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <IndianRupee className="size-3 text-foreground" />
            <p className="text-sm font-bold text-foreground">{formatCurrency(campaign.budgetAmount)}</p>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">budget</p>
        </div>
        <div className={cn("rounded-xl p-2.5 text-center", isUrgent ? "bg-amber-500/10" : isExpired ? "bg-destructive/10" : "bg-muted/50")}>
          <div className="flex items-center justify-center gap-0.5">
            <Clock className={cn("size-3", isUrgent ? "text-amber-500" : isExpired ? "text-destructive" : "text-foreground")} />
            <p className={cn("text-sm font-bold", isUrgent ? "text-amber-600 dark:text-amber-400" : isExpired ? "text-destructive" : "text-foreground")}>
              {isExpired ? "Closed" : `${daysLeft}d`}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">left</p>
        </div>
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{campaign.totalBids}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">bids</p>
        </div>
      </div>

      {/* Location + delivery */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{campaign.targetLocation}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="capitalize">{campaign.deliveryType}</span>
      </div>

      {/* CTA */}
      {!campaign.hasBid && !isExpired && (
        <Button
          size="sm"
          className="mt-4 w-full bg-gradient-ig text-white border-transparent hover:opacity-90"
          onClick={() => onBid(campaign)}
        >
          Submit Bid
        </Button>
      )}
    </div>
  );
}

function CampaignCardSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
      <Skeleton className="h-8 rounded-lg w-full" />
    </div>
  );
}

export function DiscoverPage(): ReactElement {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CampaignBrowseFilters>({ page: 1, limit: 12 });
  const [bidTarget, setBidTarget] = useState<CampaignBrowseItem | null>(null);

  const { data, isLoading } = useBrowseCampaigns(filters);
  const campaigns = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const filteredCampaigns = search
    ? campaigns.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.brandName.toLowerCase().includes(search.toLowerCase()) ||
        c.niche.some((n) => n.toLowerCase().includes(search.toLowerCase())),
      )
    : campaigns;

  const handleNicheSelect = (niche: string | undefined): void => {
    setFilters((prev) => ({ ...prev, niche: niche ? [niche] : undefined, page: 1 }));
  };

  const handlePlatformSelect = (platform: CampaignPlatform | undefined): void => {
    setFilters((prev) => ({ ...prev, platform, page: 1 }));
  };

  const clearFilters = (): void => {
    setFilters({ page: 1, limit: 12 });
  };

  const hasActiveFilters = Boolean(filters.platform || filters.niche?.length);

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
        <GradientOrb color="to" className="-bottom-32 right-0 h-[400px] w-[400px] opacity-[0.04] blur-[110px]" />
      </div>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 md:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb color="from" className="-right-20 -top-16 h-[280px] w-[280px] opacity-[0.10] blur-[70px]" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
              <Sparkles className="mr-1 size-3" />
              Campaign Marketplace
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">Discover Campaigns</h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Browse brand campaigns that match your niche and audience. Submit bids and start collaborating.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{data?.total ?? "—"}</p>
              <p className="text-xs text-muted-foreground">open campaigns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
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
              {filters.platform ? <span className="capitalize">{filters.platform}</span> : "Platform"}
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

      {/* Grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredCampaigns.length}</span> campaigns
          </p>
          <div className="flex items-center gap-1">
            <Calendar className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sorted by latest</span>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => <CampaignCardSkeleton key={i} />)}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
            <Compass className="size-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No campaigns found</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Try adjusting your filters or check back later for new campaigns.</p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="mt-4" onClick={clearFilters}>Clear filters</Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign._id} campaign={campaign} onBid={setBidTarget} />
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
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

      {/* Bid Dialog */}
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
