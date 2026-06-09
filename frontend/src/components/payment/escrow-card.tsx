"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import { CreditCard, IndianRupee, ExternalLink, Clock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useCancelEscrow, useRefreshPaymentLink } from "@/hooks/payment/usePayments";
import { EscrowStatus } from "@/types/payment.types";
import type { EscrowBrandView } from "@/types/payment.types";
import { BRAND_ESCROW_STATUS_CONFIG } from "@/config/status.config";
import { cn } from "@/lib/utils";

type EscrowCardProps = {
  escrow: EscrowBrandView;
};

export function EscrowCard({ escrow }: EscrowCardProps): ReactElement {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { mutate: cancelEscrow, isPending: isCancelling } = useCancelEscrow();
  const { mutate: refreshLink, isPending: isRefreshing } = useRefreshPaymentLink();

  const config =
    BRAND_ESCROW_STATUS_CONFIG[escrow.status] ??
    BRAND_ESCROW_STATUS_CONFIG[EscrowStatus.FUNDED];

  const isAwaitingPayment = escrow.status === EscrowStatus.AWAITING_PAYMENT;
  const canCancel = escrow.status === EscrowStatus.AWAITING_PAYMENT;
  const paymentDeadlineDate = new Date(escrow.paymentDeadline);
  const deadlinePast = paymentDeadlineDate < new Date();

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.02]"
        />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-ig text-white shadow-sm shrink-0">
              <CreditCard className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground font-mono truncate">
                #{escrow._id.slice(-8)}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(escrow.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <Badge
            variant={config.variant}
            className="shrink-0 flex items-center gap-1 text-[11px]"
          >
            <config.Icon className={config.iconClass} />
            {config.label}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground mb-0.5">Agreed Amount</p>
            <p className="text-base font-bold text-foreground flex items-center gap-0.5">
              <IndianRupee className="size-3.5" />
              {(escrow.agreedAmount / 100).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground mb-0.5">Total Charged</p>
            <p className="text-base font-bold text-foreground flex items-center gap-0.5">
              <IndianRupee className="size-3.5" />
              {(escrow.totalChargedAmount / 100).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground mb-0.5">Platform Fee</p>
            <p className="text-sm font-semibold text-muted-foreground flex items-center gap-0.5">
              <IndianRupee className="size-3" />
              {(escrow.platformFeeAmount / 100).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-3">
            <p className="text-[11px] text-muted-foreground mb-0.5">Creator Gets</p>
            <p className="text-sm font-semibold text-emerald-500 flex items-center gap-0.5">
              <IndianRupee className="size-3" />
              {(escrow.creatorReceivableAmount / 100).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {escrow.razorpayOrderId && (
          <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2">
            <p className="text-[10px] text-muted-foreground/60 mb-0.5">Razorpay Order</p>
            <p className="text-[11px] font-mono text-muted-foreground truncate">
              {escrow.razorpayOrderId}
            </p>
          </div>
        )}

        {isAwaitingPayment && (
          <div
            className={cn(
              "mt-3 flex items-center gap-2 rounded-xl px-3 py-2",
              deadlinePast ? "bg-destructive/10" : "bg-amber-500/10",
            )}
          >
            <Clock
              className={cn(
                "size-3.5 shrink-0",
                deadlinePast ? "text-destructive" : "text-amber-500",
              )}
            />
            <p
              className={cn(
                "text-xs font-medium",
                deadlinePast ? "text-destructive" : "text-amber-600 dark:text-amber-400",
              )}
            >
              {deadlinePast
                ? "Payment deadline passed"
                : `Pay by ${paymentDeadlineDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            </p>
          </div>
        )}

        {isAwaitingPayment && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-ig text-white border-transparent hover:opacity-90 gap-1.5"
              onClick={() => refreshLink(escrow._id)}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <ExternalLink className="size-3.5" />
              )}
              Pay Now
            </Button>
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this escrow?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the escrow and the bid acceptance. The creator will be notified.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => cancelEscrow(escrow._id)}
              disabled={isCancelling}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelling…" : "Yes, cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function EscrowSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
      </div>
    </div>
  );
}
