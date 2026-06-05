"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Gavel,
  AlertCircle,
  IndianRupee,
  Calendar,
  Sparkles,
  ChevronRight,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientOrb } from "@/components/common/gradient-orb";
import { useMyBids, useWithdrawBid } from "@/hooks/bid/useBids";
import { BidStatus } from "@/types/bid.types";
import type { BidWithCampaign } from "@/types/bid.types";
import { BID_STATUS_CONFIG, ACTIVE_BID_STATUSES, CLOSED_BID_STATUSES } from "@/config/status.config";
import { cn } from "@/lib/utils";

type BidCardProps = {
  bid: BidWithCampaign;
  onView: (bid: BidWithCampaign) => void;
  onWithdraw: (bid: BidWithCampaign) => void;
};

function BidCard({ bid, onView, onWithdraw }: BidCardProps): ReactElement {
  const config = BID_STATUS_CONFIG[bid.status] ?? BID_STATUS_CONFIG[BidStatus.SUBMITTED];
  const isAccepted = bid.status === BidStatus.ACCEPTED;
  const canWithdraw = bid.status === BidStatus.SUBMITTED;

  const platformIcon = bid.campaignPlatform === "instagram"
    ? <FaInstagram className="size-3" />
    : bid.campaignPlatform === "youtube"
    ? <FaYoutube className="size-3" />
    : <span className="flex gap-0.5"><FaInstagram className="size-3" /><FaYoutube className="size-3" /></span>;

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
            {new Date(bid.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">submitted</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {canWithdraw && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={(e) => { e.stopPropagation(); onWithdraw(bid); }}
          >
            <RotateCcw className="size-3 mr-1" />
            Withdraw
          </Button>
        )}
        {!canWithdraw && <span />}
        <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}

function BidDetailModal({ bid, open, onClose }: { bid: BidWithCampaign | null; open: boolean; onClose: () => void }): ReactElement {
  if (!bid) return <></>;
  const config = BID_STATUS_CONFIG[bid.status] ?? BID_STATUS_CONFIG[BidStatus.SUBMITTED];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{bid.campaignTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} className="flex items-center gap-1">
              <config.Icon className={config.iconClass} />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">by {bid.brandName}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Your Bid", value: `₹${(bid.proposedAmount / 100).toLocaleString("en-IN")}` },
              { label: "Timeline", value: `${bid.proposedTimeline} days` },
              { label: "Campaign Budget", value: `₹${(bid.campaignBudgetAtBid / 100).toLocaleString("en-IN")}` },
              { label: "Submitted", value: new Date(bid.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Pitch</p>
            <p className="text-sm text-foreground leading-relaxed">{bid.pitch}</p>
          </div>
          {bid.declineReason && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="size-3.5 text-destructive" />
                <p className="text-xs font-semibold text-destructive">Decline Reason</p>
              </div>
              <p className="text-sm text-muted-foreground">{bid.declineReason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BidSkeleton(): ReactElement {
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

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
      </div>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 md:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb color="from" className="-right-20 -top-16 h-[250px] w-[250px] opacity-[0.10] blur-[70px]" />
        </div>
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
              <Sparkles className="mr-1 size-3" />
              My Bids
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">Your Bids</h1>
            <p className="text-sm text-muted-foreground">
              Track all your campaign bids and their current status.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{activeBids.length}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </div>
            {shortlistedCount > 0 && (
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{shortlistedCount}</p>
                <p className="text-xs text-muted-foreground">shortlisted</p>
              </div>
            )}
            {acceptedCount > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-3 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{acceptedCount}</p>
                <p className="text-xs text-muted-foreground">accepted</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Tabs defaultValue="active">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="gap-1.5">
            <Gavel className="size-3.5" />
            Active
            {activeBids.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{activeBids.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="closed">
            <XCircle className="size-3.5 mr-1.5" />
            Closed
          </TabsTrigger>
        </TabsList>

        {[
          { value: "active", items: activeBids, emptyMsg: "No active bids", emptySub: "Head to Discover to browse campaigns and submit your first bid." },
          { value: "closed", items: closedBids, emptyMsg: "No closed bids", emptySub: "Declined and withdrawn bids will appear here." },
        ].map(({ value, items, emptyMsg, emptySub }) => (
          <TabsContent key={value} value={value} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <BidSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
                <Gavel className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
                <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{emptySub}</p>
              </div>
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
              You are about to withdraw your bid on &quot;{withdrawBid?.campaignTitle}&quot;. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (withdrawBid) { doWithdraw(withdrawBid._id); setWithdrawBid(null); } }}
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
