"use client";

import type { ReactElement } from "react";
import { Gavel } from "lucide-react";
import type { BidWithCreator } from "@/types/bid.types";
import { BidStatus } from "@/types/bid.types";
import { CampaignStatus } from "@/types/campaign.types";
import { BID_STATUS_CONFIG } from "@/config/status.config";
import { BidReviewCard } from "@/components/campaign/bid-review-card";
import { cn } from "@/lib/utils";

export type ActiveBidTab = "all" | BidStatus;

type CampaignBidsSectionProps = {
  bids: BidWithCreator[];
  bidsLoading: boolean;
  campaignStatus: CampaignStatus;
  campaignBudget: number;
  hasAcceptedBid: boolean;
  activeTab: ActiveBidTab;
  processingBidId: string | null;
  onTabChange: (tab: ActiveBidTab) => void;
  onShortlist: (bidId: string) => void;
  onUnshortlist: (bidId: string) => void;
  onRequestAccept: (bidId: string) => void;
  onRequestDecline: (bidId: string) => void;
};

const BID_FILTER_TABS: { value: ActiveBidTab; label: (counts: BidCounts) => string }[] = [
  { value: "all", label: (c) => `All (${c.all})` },
  { value: BidStatus.SUBMITTED, label: (c) => `New (${c[BidStatus.SUBMITTED]})` },
  { value: BidStatus.SHORTLISTED, label: (c) => `Shortlisted (${c[BidStatus.SHORTLISTED]})` },
  { value: BidStatus.ACCEPTED, label: (c) => `Accepted (${c[BidStatus.ACCEPTED]})` },
  { value: BidStatus.DECLINED, label: (c) => `Declined (${c[BidStatus.DECLINED]})` },
];

type BidCounts = {
  all: number;
  [BidStatus.SUBMITTED]: number;
  [BidStatus.SHORTLISTED]: number;
  [BidStatus.ACCEPTED]: number;
  [BidStatus.DECLINED]: number;
  [BidStatus.WITHDRAWN]: number;
};

export function CampaignBidsSection({
  bids,
  bidsLoading,
  campaignStatus,
  campaignBudget,
  hasAcceptedBid,
  activeTab,
  processingBidId,
  onTabChange,
  onShortlist,
  onUnshortlist,
  onRequestAccept,
  onRequestDecline,
}: CampaignBidsSectionProps): ReactElement {
  const counts: BidCounts = {
    all: bids.length,
    [BidStatus.SUBMITTED]: bids.filter((b) => b.status === BidStatus.SUBMITTED).length,
    [BidStatus.SHORTLISTED]: bids.filter((b) => b.status === BidStatus.SHORTLISTED).length,
    [BidStatus.ACCEPTED]: bids.filter((b) => b.status === BidStatus.ACCEPTED).length,
    [BidStatus.DECLINED]: bids.filter((b) => b.status === BidStatus.DECLINED).length,
    [BidStatus.WITHDRAWN]: bids.filter((b) => b.status === BidStatus.WITHDRAWN).length,
  };

  const filteredBids =
    activeTab === "all" ? bids : bids.filter((b) => b.status === activeTab);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Creator Bids</h2>
          <p className="text-sm text-muted-foreground">
            {bids.length === 0
              ? "No bids yet"
              : `${bids.length} bid${bids.length !== 1 ? "s" : ""} received`}
          </p>
        </div>

        {bids.length > 0 && (
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-muted p-1">
            {BID_FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  activeTab === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label(counts)}
              </button>
            ))}
          </div>
        )}
      </div>

      {bidsLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : filteredBids.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <Gavel className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {activeTab === "all"
                ? "No bids yet"
                : `No ${BID_STATUS_CONFIG[activeTab as BidStatus]?.label.toLowerCase() ?? ""} bids`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeTab === "all"
                ? campaignStatus === CampaignStatus.ACTIVE
                  ? "Bids will appear here once creators start applying."
                  : "Publish the campaign to start receiving bids."
                : "No bids match this filter."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredBids.map((bid) => (
            <BidReviewCard
              key={bid._id}
              bid={bid}
              campaignBudget={campaignBudget}
              hasAcceptedBid={hasAcceptedBid}
              processingBidId={processingBidId}
              onShortlist={onShortlist}
              onUnshortlist={onUnshortlist}
              onRequestAccept={onRequestAccept}
              onRequestDecline={onRequestDecline}
            />
          ))}
        </div>
      )}
    </div>
  );
}
