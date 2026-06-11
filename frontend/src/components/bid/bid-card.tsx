"use client";

import type { ReactElement } from "react";
import { IndianRupee, Calendar, ChevronRight, RotateCcw } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BidWithCampaign } from "@/types/bid.types";
import { BidStatus } from "@/types/bid.types";
import { BID_STATUS_CONFIG } from "@/config/status.config";
import { cn } from "@/lib/utils";

type BidCardProps = {
  bid: BidWithCampaign;
  onView: (bid: BidWithCampaign) => void;
  onWithdraw: (bid: BidWithCampaign) => void;
};

export function BidCard({ bid, onView, onWithdraw }: BidCardProps): ReactElement {
  const config = BID_STATUS_CONFIG[bid.status] ?? BID_STATUS_CONFIG[BidStatus.SUBMITTED];
  const isAccepted = bid.status === BidStatus.ACCEPTED;
  const canWithdraw = bid.status === BidStatus.SUBMITTED;

  const platformIcon =
    bid.campaignPlatform === "instagram" ? (
      <FaInstagram className="size-3" />
    ) : bid.campaignPlatform === "youtube" ? (
      <FaYoutube className="size-3" />
    ) : (
      <span className="flex gap-0.5">
        <FaInstagram className="size-3" />
        <FaYoutube className="size-3" />
      </span>
    );

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-md cursor-pointer",
        isAccepted ? "border-emerald-500/40" : "border-border/60 hover:border-border",
      )}
      onClick={() => onView(bid)}
    >
      {isAccepted && (
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-ig rounded-t-2xl" />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground line-clamp-1">{bid.campaignTitle}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            {platformIcon}
            <span>{bid.brandName}</span>
          </div>
        </div>
        <Badge variant={config.variant} className="shrink-0 flex items-center gap-1 text-[11px]">
          <config.Icon className={config.iconClass} />
          {config.label}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <IndianRupee className="size-3 text-foreground" />
            <p className="text-sm font-bold text-foreground">
              {(bid.proposedAmount / 100).toLocaleString("en-IN")}
            </p>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">your bid</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <div className="flex items-center justify-center gap-0.5">
            <Calendar className="size-3 text-foreground" />
            <p className="text-sm font-bold text-foreground">{bid.proposedTimeline}d</p>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">timeline</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-sm font-bold text-foreground">
            {new Date(bid.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">submitted</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {canWithdraw ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw(bid);
            }}
          >
            <RotateCcw className="size-3 mr-1" />
            Withdraw
          </Button>
        ) : (
          <span />
        )}
        <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}

export function BidCardSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
    </div>
  );
}
