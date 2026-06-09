"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { Gavel, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GradientOrb } from "@/components/common/gradient-orb";
import { PageHero } from "@/components/common/page-hero";
import { EmptyState } from "@/components/common/empty-state";
import { BidCard, BidCardSkeleton } from "@/components/bid/bid-card";
import { BidDetailModal } from "@/components/bid/bid-detail-modal";
import { useMyBids, useWithdrawBid } from "@/hooks/bid/useBids";
import { BidStatus } from "@/types/bid.types";
import type { BidWithCampaign } from "@/types/bid.types";
import { ACTIVE_BID_STATUSES, CLOSED_BID_STATUSES } from "@/config/status.config";

export function CreatorBidsPage(): ReactElement {
  const [viewBid, setViewBid] = useState<BidWithCampaign | null>(null);
  const [withdrawBid, setWithdrawBid] = useState<BidWithCampaign | null>(null);

  const { data, isLoading } = useMyBids();
  const { mutate: doWithdraw, isPending: isWithdrawing } = useWithdrawBid();

  const bids = data?.items ?? [];
  const activeBids = bids.filter((b) => ACTIVE_BID_STATUSES.includes(b.status));
  const closedBids = bids.filter((b) => CLOSED_BID_STATUSES.includes(b.status));
  const shortlistedCount = bids.filter((b) => b.status === BidStatus.SHORTLISTED).length;
  const acceptedCount = bids.filter((b) => b.status === BidStatus.ACCEPTED).length;

  const tabConfig = [
    {
      value: "active",
      items: activeBids,
      emptyTitle: "No active bids",
      emptySub: "Head to Discover to browse campaigns and submit your first bid.",
    },
    {
      value: "closed",
      items: closedBids,
      emptyTitle: "No closed bids",
      emptySub: "Declined and withdrawn bids will appear here.",
    },
  ];

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
      </div>

      <PageHero
        badge="My Bids"
        title="Your Bids"
        subtitle="Track all your campaign bids and their current status."
        stats={[
          { value: activeBids.length, label: "active" },
          {
            value: shortlistedCount,
            label: "shortlisted",
            hidden: shortlistedCount === 0,
            borderClass: "border-blue-500/30 bg-blue-500/10",
            colorClass: "text-blue-600 dark:text-blue-400",
          },
          {
            value: acceptedCount,
            label: "accepted",
            hidden: acceptedCount === 0,
            borderClass: "border-emerald-500/30 bg-emerald-500/10",
            colorClass: "text-emerald-600 dark:text-emerald-400",
          },
        ]}
      />

      <Tabs defaultValue="active">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="gap-1.5">
            <Gavel className="size-3.5" />
            Active
            {activeBids.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {activeBids.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="closed">
            <XCircle className="size-3.5 mr-1.5" />
            Closed
          </TabsTrigger>
        </TabsList>

        {tabConfig.map(({ value, items, emptyTitle, emptySub }) => (
          <TabsContent key={value} value={value} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <BidCardSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <EmptyState icon={<Gavel className="size-10" />} title={emptyTitle} subtitle={emptySub} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((b) => (
                  <BidCard key={b._id} bid={b} onView={setViewBid} onWithdraw={setWithdrawBid} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <BidDetailModal bid={viewBid} open={Boolean(viewBid)} onClose={() => setViewBid(null)} />

      <AlertDialog open={Boolean(withdrawBid)} onOpenChange={(v) => !v && setWithdrawBid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw this bid?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to withdraw your bid on &quot;{withdrawBid?.campaignTitle}&quot;. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (withdrawBid) {
                  doWithdraw(withdrawBid._id);
                  setWithdrawBid(null);
                }
              }}
              disabled={isWithdrawing}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isWithdrawing ? "Withdrawing…" : "Yes, withdraw"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
