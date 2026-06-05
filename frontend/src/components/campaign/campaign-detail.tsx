"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  Eye,
  Gavel,
  Rocket,
  EyeOff,
  X,
  MapPin,
  Globe,
  FileText,
  RefreshCw,
  Repeat2,
  Users,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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
import { CampaignStatus, CampaignPlatform, CampaignDeliveryType, TargetGender } from "@/types/campaign.types";
import { BidStatus } from "@/types/bid.types";
import { CAMPAIGN_STATUS_CONFIG, BID_STATUS_CONFIG } from "@/config/status.config";
import { formatCurrency, formatDate, getDaysLeft } from "@/lib/formatters";
import { CampaignDetailSkeleton } from "@/components/campaign/campaign-detail-skeleton";
import { CampaignStatCard } from "@/components/campaign/campaign-stat-card";
import { BidReviewCard } from "@/components/campaign/bid-review-card";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type ActiveBidTab = "all" | BidStatus;

type CampaignDetailProps = {
  id: string;
};

// ── Component ─────────────────────────────────────────────────────────────────

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
  const isExpired = daysLeft < 0;

  const bidCounts = {
    all: bids.length,
    [BidStatus.SUBMITTED]: bids.filter((b) => b.status === BidStatus.SUBMITTED).length,
    [BidStatus.SHORTLISTED]: bids.filter((b) => b.status === BidStatus.SHORTLISTED).length,
    [BidStatus.ACCEPTED]: bids.filter((b) => b.status === BidStatus.ACCEPTED).length,
    [BidStatus.DECLINED]: bids.filter((b) => b.status === BidStatus.DECLINED).length,
    [BidStatus.WITHDRAWN]: bids.filter((b) => b.status === BidStatus.WITHDRAWN).length,
  };

  const filteredBids =
    activeTab === "all" ? bids : bids.filter((b) => b.status === activeTab);

  const isIG =
    campaign.platform === CampaignPlatform.INSTAGRAM ||
    campaign.platform === CampaignPlatform.BOTH;
  const isYT =
    campaign.platform === CampaignPlatform.YOUTUBE ||
    campaign.platform === CampaignPlatform.BOTH;

  const req = campaign.creatorRequirements;
  const statusCfg = CAMPAIGN_STATUS_CONFIG[campaign.status];
  const isPendingCampaignAction = isPublishing || isUnpublishing || isClosing;

  const BID_FILTER_TABS: { value: ActiveBidTab; label: string }[] = [
    { value: "all", label: `All (${bidCounts.all})` },
    { value: BidStatus.SUBMITTED, label: `New (${bidCounts[BidStatus.SUBMITTED]})` },
    { value: BidStatus.SHORTLISTED, label: `Shortlisted (${bidCounts[BidStatus.SHORTLISTED]})` },
    { value: BidStatus.ACCEPTED, label: `Accepted (${bidCounts[BidStatus.ACCEPTED]})` },
    { value: BidStatus.DECLINED, label: `Declined (${bidCounts[BidStatus.DECLINED]})` },
  ];

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

  function handleClose(): void {
    setCloseConfirm(false);
    close(id);
  }

  return (
    <>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Link
          href={ROUTES.brand.campaigns}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Campaigns
        </Link>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={cn("border px-2.5 py-1 text-xs font-semibold", statusCfg.style)}
              >
                {statusCfg.label}
              </Badge>
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {isIG && <FaInstagram className="size-3" />}
                {isYT && <FaYoutube className="size-3" />}
                <span>
                  {campaign.platform === CampaignPlatform.INSTAGRAM
                    ? "Instagram"
                    : campaign.platform === CampaignPlatform.YOUTUBE
                      ? "YouTube"
                      : "IG + YouTube"}
                </span>
              </div>
              {campaign.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  Published {formatDate(campaign.publishedAt)}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {campaign.title}
            </h1>
            <div className="flex flex-wrap items-center gap-1.5">
              {campaign.niche.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {campaign.status === CampaignStatus.DRAFT && (
              <Button
                size="sm"
                className="gap-1.5 border-transparent bg-gradient-ig text-white hover:opacity-90"
                onClick={() => publish(campaign._id)}
                disabled={isPendingCampaignAction}
              >
                <Rocket className="size-3.5" />
                Publish Campaign
              </Button>
            )}
            {campaign.status === CampaignStatus.ACTIVE && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => unpublish(campaign._id)}
                disabled={isPendingCampaignAction}
              >
                <EyeOff className="size-3.5" />
                Unpublish
              </Button>
            )}
            {(campaign.status === CampaignStatus.DRAFT ||
              campaign.status === CampaignStatus.ACTIVE) && (
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setCloseConfirm(true)}
                disabled={isPendingCampaignAction}
              >
                <X className="size-3.5" />
                Close Campaign
              </Button>
            )}
          </div>
        </div>

        {/* Stats strip */}
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
            value={isExpired ? "Expired" : `${daysLeft}d left`}
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

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
          {/* Left column */}
          <div className="space-y-5">
            {/* Campaign brief */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-ig text-white">
                  <FileText className="size-3.5" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">Campaign Brief</h2>
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {campaign.contentBrief}
              </p>
            </div>

            {/* Creator requirements */}
            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                  <Users className="size-3.5 text-muted-foreground" />
                </div>
                <h2 className="text-sm font-semibold text-foreground">
                  Creator Requirements
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RequirementGroup label="Audience">
                  <RequirementRow
                    label="Age Range"
                    value={`${campaign.targetAgeMin}–${campaign.targetAgeMax} yrs`}
                  />
                  <RequirementRow
                    label="Gender"
                    value={
                      campaign.targetGender === TargetGender.ANY
                        ? "Any"
                        : campaign.targetGender === TargetGender.MALE
                          ? "Male"
                          : "Female"
                    }
                  />
                  <RequirementRow label="Location" value={campaign.targetLocation} />
                  {req.languages && req.languages.length > 0 && (
                    <RequirementRow label="Languages" value={req.languages.join(", ")} />
                  )}
                </RequirementGroup>

                {isIG && req.instagram && (
                  <RequirementGroup
                    label="Instagram"
                    icon={<FaInstagram className="size-2.5" />}
                  >
                    {req.instagram.minFollowers !== undefined && (
                      <RequirementRow
                        label="Followers"
                        value={`${req.instagram.minFollowers.toLocaleString("en-IN")}${req.instagram.maxFollowers ? `–${req.instagram.maxFollowers.toLocaleString("en-IN")}` : "+"}`}
                      />
                    )}
                    {req.instagram.minEngagementRate !== undefined && (
                      <RequirementRow
                        label="Engagement"
                        value={`≥ ${req.instagram.minEngagementRate}%`}
                      />
                    )}
                    {req.instagram.minAvgReelViews !== undefined && (
                      <RequirementRow
                        label="Avg. Reel Views"
                        value={`≥ ${req.instagram.minAvgReelViews.toLocaleString("en-IN")}`}
                      />
                    )}
                    {req.instagram.minPostsPerMonth !== undefined && (
                      <RequirementRow
                        label="Posts/Month"
                        value={`≥ ${req.instagram.minPostsPerMonth}`}
                      />
                    )}
                  </RequirementGroup>
                )}

                {isYT && req.youtube && (
                  <RequirementGroup
                    label="YouTube"
                    icon={<FaYoutube className="size-2.5" />}
                  >
                    {req.youtube.minSubscribers !== undefined && (
                      <RequirementRow
                        label="Subscribers"
                        value={`${req.youtube.minSubscribers.toLocaleString("en-IN")}${req.youtube.maxSubscribers ? `–${req.youtube.maxSubscribers.toLocaleString("en-IN")}` : "+"}`}
                      />
                    )}
                    {req.youtube.minAvgVideoViews !== undefined && (
                      <RequirementRow
                        label="Avg. Views"
                        value={`≥ ${req.youtube.minAvgVideoViews.toLocaleString("en-IN")}`}
                      />
                    )}
                    {req.youtube.minVideosPerMonth !== undefined && (
                      <RequirementRow
                        label="Videos/Month"
                        value={`≥ ${req.youtube.minVideosPerMonth}`}
                      />
                    )}
                  </RequirementGroup>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">
                Campaign Details
              </h3>
              <div className="space-y-3">
                <SidebarRow
                  icon={
                    isIG && isYT ? (
                      <span className="flex gap-0.5">
                        <FaInstagram className="size-3.5" />
                        <FaYoutube className="size-3.5" />
                      </span>
                    ) : isIG ? (
                      <FaInstagram className="size-3.5" />
                    ) : (
                      <FaYoutube className="size-3.5" />
                    )
                  }
                  label="Platform"
                  value={
                    campaign.platform === CampaignPlatform.INSTAGRAM
                      ? "Instagram"
                      : campaign.platform === CampaignPlatform.YOUTUBE
                        ? "YouTube"
                        : "Instagram + YouTube"
                  }
                />
                <SidebarRow
                  icon={
                    campaign.deliveryType === CampaignDeliveryType.ONSITE ? (
                      <MapPin className="size-3.5" />
                    ) : (
                      <Globe className="size-3.5" />
                    )
                  }
                  label="Delivery"
                  value={
                    campaign.deliveryType === CampaignDeliveryType.ONSITE
                      ? "On-site"
                      : "Remote"
                  }
                />
                {campaign.shootingLocation && (
                  <SidebarRow
                    icon={<MapPin className="size-3.5" />}
                    label="Shooting Radius"
                    value={`Within ${campaign.shootingLocation.radiusKm ?? "?"}km`}
                  />
                )}
                <SidebarRow
                  icon={<Repeat2 className="size-3.5" />}
                  label="Revisions"
                  value={`${campaign.revisionRounds} round${campaign.revisionRounds > 1 ? "s" : ""}`}
                />
                <SidebarRow
                  icon={<Clock className="size-3.5" />}
                  label="Created"
                  value={formatDate(campaign.createdAt)}
                />
                {campaign.closedAt && (
                  <SidebarRow
                    icon={<X className="size-3.5" />}
                    label="Closed"
                    value={formatDate(campaign.closedAt)}
                  />
                )}
              </div>
            </div>

            {campaign.status === CampaignStatus.DRAFT && (
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                  Draft — Not visible to creators
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Publish this campaign to start receiving bids from creators.
                </p>
                <button
                  type="button"
                  onClick={() => publish(campaign._id)}
                  disabled={isPendingCampaignAction}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-ig px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Rocket className="size-3" />
                  Publish Now
                </button>
              </div>
            )}

            {campaign.status === CampaignStatus.ACTIVE && hasAcceptedBid && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  Creator accepted
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  An escrow has been created. Head to Collabs to manage the collaboration.
                </p>
                <Link
                  href={ROUTES.brand.collabs}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Go to Collabs →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bids section */}
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
                    onClick={() => setActiveTab(tab.value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                      activeTab === tab.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab.label}
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
                    ? campaign.status === CampaignStatus.ACTIVE
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
                  campaignBudget={campaign.budgetAmount}
                  hasAcceptedBid={hasAcceptedBid}
                  processingBidId={processingBidId}
                  onShortlist={handleShortlist}
                  onUnshortlist={handleUnshortlist}
                  onRequestAccept={setAcceptConfirmId}
                  onRequestDecline={setDeclineConfirmId}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Confirm dialogs ─────────────────────────────────────────────────── */}

      <AlertDialog open={closeConfirm} onOpenChange={setCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently close the campaign. It will no longer accept new bids
              and cannot be re-opened. Any pending bids will be auto-declined.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClose}
              disabled={isClosing}
              className="border-transparent bg-destructive text-white hover:bg-destructive/90"
            >
              Close Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(acceptConfirmId)}
        onOpenChange={(open) => !open && setAcceptConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept this bid?</AlertDialogTitle>
            <AlertDialogDescription>
              Accepting creates an escrow and locks the collab. All other pending bids
              will be auto-declined. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAccept}
              className="border-transparent bg-gradient-ig text-white hover:opacity-90"
            >
              Accept &amp; Create Escrow
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(declineConfirmId)}
        onOpenChange={(open) => !open && setDeclineConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline this bid?</AlertDialogTitle>
            <AlertDialogDescription>
              The creator will be notified that their bid was not selected. This cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDecline}
              className="border-transparent bg-destructive text-white hover:bg-destructive/90"
            >
              Decline Bid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ── Micro sub-components (< 20 lines, exclusively used by CampaignDetail) ────

type RequirementGroupProps = {
  label: string;
  icon?: ReactElement;
  children: React.ReactNode;
};

function RequirementGroup({ label, icon, children }: RequirementGroupProps): ReactElement {
  return (
    <div className="rounded-xl bg-muted/40 p-4 space-y-2.5">
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

type RequirementRowProps = { label: string; value: string };

function RequirementRow({ label, value }: RequirementRowProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="truncate text-right text-[11px] font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}

type SidebarRowProps = { icon: ReactElement; label: string; value: string };

function SidebarRow({ icon, label, value }: SidebarRowProps): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
