"use client";

import type { ReactElement } from "react";
import { FaInstagram } from "react-icons/fa";
import { MapPin, Users, Bookmark, BookmarkCheck, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BID_STATUS_CONFIG } from "@/config/status.config";
import { formatCurrency, formatFollowers, formatDate, getInitials } from "@/lib/formatters";
import type { BidWithCreator } from "@/types/bid.types";
import { BidStatus } from "@/types/bid.types";
import { cn } from "@/lib/utils";

export type BidReviewCardProps = {
  bid: BidWithCreator;
  campaignBudget: number;
  hasAcceptedBid: boolean;
  processingBidId: string | null;
  onShortlist: (id: string) => void;
  onUnshortlist: (id: string) => void;
  onRequestAccept: (id: string) => void;
  onRequestDecline: (id: string) => void;
};

export function BidReviewCard({
  bid,
  campaignBudget,
  hasAcceptedBid,
  processingBidId,
  onShortlist,
  onUnshortlist,
  onRequestAccept,
  onRequestDecline,
}: BidReviewCardProps): ReactElement {
  const isProcessing = processingBidId === bid._id;
  const isShortlisted = bid.status === BidStatus.SHORTLISTED;
  const canAct =
    bid.status === BidStatus.SUBMITTED || bid.status === BidStatus.SHORTLISTED;
  const isFinal =
    bid.status === BidStatus.ACCEPTED ||
    bid.status === BidStatus.DECLINED ||
    bid.status === BidStatus.WITHDRAWN;

  const amountRatio = bid.proposedAmount / campaignBudget;
  const amountColor =
    amountRatio <= 0.8
      ? "text-emerald-600 dark:text-emerald-400"
      : amountRatio <= 1
        ? "text-foreground"
        : "text-amber-600 dark:text-amber-400";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-md",
        bid.status === BidStatus.ACCEPTED
          ? "border-emerald-500/30"
          : bid.status === BidStatus.SHORTLISTED
            ? "border-amber-500/30"
            : "border-border/60",
      )}
    >
      {bid.status === BidStatus.ACCEPTED && (
        <div className="h-[3px] bg-gradient-ig rounded-t-2xl" />
      )}

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Creator header */}
        <div className="flex items-start gap-3">
          <Avatar className="size-11 shrink-0 border-2 border-border/40">
            {bid.creator.instagramProfilePicUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bid.creator.instagramProfilePicUrl}
                alt={bid.creator.fullName}
                className="size-full object-cover"
              />
            )}
            <AvatarFallback className="bg-gradient-ig text-white text-sm font-bold">
              {getInitials(bid.creator.fullName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-foreground">
                {bid.creator.fullName}
              </p>
              {bid.creator.matchScore !== undefined && (
                <span className="shrink-0 rounded-md bg-gradient-ig px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {bid.creator.matchScore}% match
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {bid.creator.instagramHandle && (
                <span className="flex items-center gap-0.5">
                  <FaInstagram className="size-2.5" />@{bid.creator.instagramHandle}
                </span>
              )}
              {bid.creator.instagramFollowers > 0 && (
                <span className="flex items-center gap-0.5">
                  <Users className="size-2.5" />
                  {formatFollowers(bid.creator.instagramFollowers)}
                </span>
              )}
              {bid.creator.city && (
                <span className="flex items-center gap-0.5">
                  <MapPin className="size-2.5" />
                  {bid.creator.city}
                </span>
              )}
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "shrink-0 border text-[10px] font-semibold px-2 py-0.5",
              BID_STATUS_CONFIG[bid.status].style,
            )}
          >
            {BID_STATUS_CONFIG[bid.status].label}
          </Badge>
        </div>

        {/* Niche tags */}
        {bid.creator.niche.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bid.creator.niche.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator />

        {/* Proposal stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className={cn("text-base font-bold", amountColor)}>
              {formatCurrency(bid.proposedAmount)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Proposed amount</p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-base font-bold text-foreground">{bid.proposedTimeline}d</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Delivery timeline</p>
          </div>
        </div>

        {/* Pitch */}
        {bid.pitch && (
          <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
            &ldquo;{bid.pitch}&rdquo;
          </p>
        )}

        <div className="flex-1" />

        {/* Actions */}
        {canAct && !hasAcceptedBid && (
          <>
            <Separator />
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() =>
                  isShortlisted ? onUnshortlist(bid._id) : onShortlist(bid._id)
                }
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium transition-all disabled:opacity-50",
                  isShortlisted
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                    : "border-border/60 bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {isShortlisted ? (
                  <BookmarkCheck className="size-3.5" />
                ) : (
                  <Bookmark className="size-3.5" />
                )}
                {isShortlisted ? "Shortlisted" : "Shortlist"}
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onRequestAccept(bid._id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600 transition-all hover:bg-emerald-500/20 disabled:opacity-50 dark:text-emerald-400"
              >
                <CheckCircle2 className="size-3.5" />
                Accept
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => onRequestDecline(bid._id)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 transition-all hover:bg-red-500/20 disabled:opacity-50 dark:text-red-400"
              >
                <XCircle className="size-3.5" />
                Decline
              </button>
            </div>
          </>
        )}

        {isFinal && bid.status === BidStatus.ACCEPTED && (
          <>
            <Separator />
            <p className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              Accepted{bid.acceptedAt ? ` · ${formatDate(bid.acceptedAt)}` : ""}
            </p>
          </>
        )}

        {isFinal && bid.status === BidStatus.DECLINED && (
          <>
            <Separator />
            <p className="text-[11px] text-muted-foreground">
              Declined{bid.declineReason ? ` · ${bid.declineReason}` : ""}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
