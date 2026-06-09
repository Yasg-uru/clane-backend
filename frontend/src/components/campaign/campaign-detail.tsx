"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import { AlertTriangle, RefreshCw, Calendar, IndianRupee, Eye, Gavel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCampaignDetail,
  usePublishCampaign,
  useUnpublishCampaign,
  useCloseCampaign,
} from "@/hooks/campaign/useCampaigns";
import {
  useBidsForCampaign,
  useShortlistBid,
  useUnshortlistBid,
  useAcceptBid,
  useDeclineBid,
} from "@/hooks/bid/useBids";
import { BidStatus } from "@/types/bid.types";
import { formatCurrency, formatDate, getDaysLeft } from "@/lib/formatters";
import { CampaignDetailSkeleton } from "@/components/campaign/campaign-detail-skeleton";
import { CampaignStatCard } from "@/components/campaign/campaign-stat-card";
import { CampaignHeader } from "@/components/campaign/campaign-header";
import { CampaignBrief } from "@/components/campaign/campaign-brief";
import { CampaignRequirements } from "@/components/campaign/campaign-requirements";
import { CampaignSidebar } from "@/components/campaign/campaign-sidebar";
import { CampaignBidsSection } from "@/components/campaign/campaign-bids-section";
import { CampaignConfirmDialogs } from "@/components/campaign/campaign-confirm-dialogs";
import type { ActiveBidTab } from "@/components/campaign/campaign-bids-section";

type CampaignDetailProps = {
  id: string;
};

export function CampaignDetail({ id }: CampaignDetailProps): ReactElement {
  const { data: campaign, isLoading, isError, refetch } = useCampaignDetail(id);
  const { data: bidsData, isLoading: bidsLoading } = useBidsForCampaign(id);

  const { mutate: publish, isPending: isPublishing } = usePublishCampaign();
  const { mutate: unpublish, isPending: isUnpublishing } = useUnpublishCampaign();
  const { mutate: close, isPending: isClosing } = useCloseCampaign();
  const { mutate: shortlist } = useShortlistBid();
  const { mutate: unshortlist } = useUnshortlistBid();
  const { mutate: accept } = useAcceptBid();
  const { mutate: decline } = useDeclineBid();

  const [activeTab, setActiveTab] = useState<ActiveBidTab>("all");
  const [processingBidId, setProcessingBidId] = useState<string | null>(null);
  const [closeConfirm, setCloseConfirm] = useState(false);
  const [acceptConfirmId, setAcceptConfirmId] = useState<string | null>(null);
  const [declineConfirmId, setDeclineConfirmId] = useState<string | null>(null);

  if (isLoading) return <CampaignDetailSkeleton />;

  if (isError || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
          <AlertTriangle className="size-6 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">Failed to load campaign</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Could not fetch the campaign details. Please try again.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          <RefreshCw className="size-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  const bids = bidsData?.items ?? [];
  const hasAcceptedBid = bids.some((b) => b.status === BidStatus.ACCEPTED);
  const daysLeft = getDaysLeft(campaign.deadline);
  const isPendingCampaignAction = isPublishing || isUnpublishing || isClosing;

  function handleShortlist(bidId: string): void {
    setProcessingBidId(bidId);
    shortlist(bidId, { onSettled: () => setProcessingBidId(null) });
  }

  function handleUnshortlist(bidId: string): void {
    setProcessingBidId(bidId);
    unshortlist(bidId, { onSettled: () => setProcessingBidId(null) });
  }

  function handleAccept(): void {
    if (!acceptConfirmId) return;
    const bidId = acceptConfirmId;
    setAcceptConfirmId(null);
    setProcessingBidId(bidId);
    accept(bidId, { onSettled: () => setProcessingBidId(null) });
  }

  function handleDecline(): void {
    if (!declineConfirmId) return;
    const bidId = declineConfirmId;
    setDeclineConfirmId(null);
    setProcessingBidId(bidId);
    decline(bidId, { onSettled: () => setProcessingBidId(null) });
  }

  return (
    <>
      <div className="space-y-8">
        <CampaignHeader
          campaign={campaign}
          isPendingAction={isPendingCampaignAction}
          onPublish={() => publish(campaign._id)}
          onUnpublish={() => unpublish(campaign._id)}
          onCloseRequest={() => setCloseConfirm(true)}
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <CampaignStatCard
            icon={<IndianRupee className="size-4" />}
            label="Campaign Budget"
            value={formatCurrency(campaign.budgetAmount)}
            accent
          />
          <CampaignStatCard
            icon={<Calendar className="size-4" />}
            label="Deadline"
            value={daysLeft < 0 ? "Expired" : `${daysLeft}d left`}
            sub={formatDate(campaign.deadline)}
          />
          <CampaignStatCard
            icon={<Gavel className="size-4" />}
            label="Total Bids"
            value={campaign.totalBids.toString()}
            sub={hasAcceptedBid ? "1 accepted" : "Awaiting review"}
          />
          <CampaignStatCard
            icon={<Eye className="size-4" />}
            label="Views"
            value={campaign.viewCount.toLocaleString("en-IN")}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <CampaignBrief contentBrief={campaign.contentBrief} />
            <CampaignRequirements campaign={campaign} />
          </div>
          <CampaignSidebar
            campaign={campaign}
            hasAcceptedBid={hasAcceptedBid}
            isPendingAction={isPendingCampaignAction}
            onPublish={() => publish(campaign._id)}
          />
        </div>

        <CampaignBidsSection
          bids={bids}
          bidsLoading={bidsLoading}
          campaignStatus={campaign.status}
          campaignBudget={campaign.budgetAmount}
          hasAcceptedBid={hasAcceptedBid}
          activeTab={activeTab}
          processingBidId={processingBidId}
          onTabChange={setActiveTab}
          onShortlist={handleShortlist}
          onUnshortlist={handleUnshortlist}
          onRequestAccept={setAcceptConfirmId}
          onRequestDecline={setDeclineConfirmId}
        />
      </div>

      <CampaignConfirmDialogs
        closeConfirm={closeConfirm}
        onCloseConfirmChange={setCloseConfirm}
        onClose={() => { setCloseConfirm(false); close(id); }}
        isClosing={isClosing}
        acceptConfirmOpen={Boolean(acceptConfirmId)}
        onAcceptConfirmClose={() => setAcceptConfirmId(null)}
        onAccept={handleAccept}
        declineConfirmOpen={Boolean(declineConfirmId)}
        onDeclineConfirmClose={() => setDeclineConfirmId(null)}
        onDecline={handleDecline}
      />
    </>
  );
}
