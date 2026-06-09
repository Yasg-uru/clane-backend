"use client";

import type { ReactElement } from "react";
import { IndianRupee, MapPin, Clock, CheckCircle2 } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CampaignBrowseItem } from "@/types/creator.types";
import { CampaignPlatform } from "@/types/campaign.types";
import { formatCurrency, getDaysLeft } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type DiscoverCampaignCardProps = {
  campaign: CampaignBrowseItem;
  onBid: (campaign: CampaignBrowseItem) => void;
};

export function DiscoverCampaignCard({ campaign, onBid }: DiscoverCampaignCardProps): ReactElement {
  const daysLeft = getDaysLeft(campaign.deadline);
  const isUrgent = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  const platformIcon =
    campaign.platform === CampaignPlatform.INSTAGRAM ? (
      <FaInstagram className="size-3.5" />
    ) : campaign.platform === CampaignPlatform.YOUTUBE ? (
      <FaYoutube className="size-3.5" />
    ) : (
      <span className="flex gap-0.5">
        <FaInstagram className="size-3" />
        <FaYoutube className="size-3" />
      </span>
    );

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5",
        campaign.hasBid ? "border-emerald-500/40" : "border-border/60 hover:border-border/90",
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-0 group-hover:opacity-[0.02] transition-opacity"
      />

      {campaign.hasBid && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 border border-emerald-500/30">
          <CheckCircle2 className="size-3 text-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Bid Submitted
          </span>
        </div>
      )}

      <div className="pr-20">
        <p className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
          {campaign.title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{campaign.brandName}</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <div className="flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5 text-[11px] text-muted-foreground">
          {platformIcon}
          <span className="capitalize">{campaign.platform}</span>
        </div>
        {campaign.niche.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
            {tag}
          </Badge>
        ))}
        {campaign.niche.length > 2 && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
            +{campaign.niche.length - 2}
          </Badge>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/50 p-2.5 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <IndianRupee className="size-3 text-foreground" />
            <p className="text-sm font-bold text-foreground">{formatCurrency(campaign.budgetAmount)}</p>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">budget</p>
        </div>
        <div
          className={cn(
            "rounded-xl p-2.5 text-center",
            isUrgent ? "bg-amber-500/10" : isExpired ? "bg-destructive/10" : "bg-muted/50",
          )}
        >
          <div className="flex items-center justify-center gap-0.5">
            <Clock
              className={cn(
                "size-3",
                isUrgent ? "text-amber-500" : isExpired ? "text-destructive" : "text-foreground",
              )}
            />
            <p
              className={cn(
                "text-sm font-bold",
                isUrgent
                  ? "text-amber-600 dark:text-amber-400"
                  : isExpired
                  ? "text-destructive"
                  : "text-foreground",
              )}
            >
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

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <MapPin className="size-3 shrink-0" />
        <span className="truncate">{campaign.targetLocation}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="capitalize">{campaign.deliveryType}</span>
      </div>

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

export function DiscoverCampaignCardSkeleton(): ReactElement {
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
