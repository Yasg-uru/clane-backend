"use client";

import type { ReactElement } from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BidWithCampaign } from "@/types/bid.types";
import { BidStatus } from "@/types/bid.types";
import { BID_STATUS_CONFIG } from "@/config/status.config";

type BidDetailModalProps = {
  bid: BidWithCampaign | null;
  open: boolean;
  onClose: () => void;
};

export function BidDetailModal({ bid, open, onClose }: BidDetailModalProps): ReactElement {
  if (!bid) return <></>;

  const config = BID_STATUS_CONFIG[bid.status] ?? BID_STATUS_CONFIG[BidStatus.SUBMITTED];

  const details = [
    { label: "Your Bid", value: `₹${(bid.proposedAmount / 100).toLocaleString("en-IN")}` },
    { label: "Timeline", value: `${bid.proposedTimeline} days` },
    {
      label: "Campaign Budget",
      value: `₹${(bid.campaignBudgetAtBid / 100).toLocaleString("en-IN")}`,
    },
    {
      label: "Submitted",
      value: new Date(bid.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
  ];

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
            {details.map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Your Pitch
            </p>
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
