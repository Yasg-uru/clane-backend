"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  CreditCard,
  IndianRupee,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  Clock,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
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
import { GradientOrb } from "@/components/common/gradient-orb";
import { useEscrows, useCancelEscrow, useRefreshPaymentLink } from "@/hooks/payment/usePayments";
import { EscrowStatus } from "@/types/payment.types";
import type { EscrowBrandView } from "@/types/payment.types";
import { BRAND_ESCROW_STATUS_CONFIG } from "@/config/status.config";
import { formatRupees } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type EscrowCardProps = {
  escrow: EscrowBrandView;
};

function EscrowCard({ escrow }: EscrowCardProps): ReactElement {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const { mutate: cancelEscrow, isPending: isCancelling } = useCancelEscrow();
  const { mutate: refreshLink, isPending: isRefreshing } = useRefreshPaymentLink();

  const config = BRAND_ESCROW_STATUS_CONFIG[escrow.status] ?? BRAND_ESCROW_STATUS_CONFIG[EscrowStatus.FUNDED];
  const isAwaitingPayment = escrow.status === EscrowStatus.AWAITING_PAYMENT;
  const canCancel = escrow.status === EscrowStatus.AWAITING_PAYMENT;
  const paymentDeadlineDate = new Date(escrow.paymentDeadline);
  const deadlinePast = paymentDeadlineDate < new Date();

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.02]" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-ig text-white shadow-sm shrink-0">
              <CreditCard className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground font-mono truncate">#{escrow._id.slice(-8)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(escrow.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
          <Badge variant={config.variant} className="shrink-0 flex items-center gap-1 text-[11px]">
            <config.Icon className={config.iconClass} />
            {config.label}
          </Badge>
        </div>

        {/* Amounts */}
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

        {/* Razorpay order ID */}
        {escrow.razorpayOrderId && (
          <div className="mt-3 rounded-xl bg-muted/40 px-3 py-2">
            <p className="text-[10px] text-muted-foreground/60 mb-0.5">Razorpay Order</p>
            <p className="text-[11px] font-mono text-muted-foreground truncate">{escrow.razorpayOrderId}</p>
          </div>
        )}

        {/* Deadline */}
        {isAwaitingPayment && (
          <div className={cn(
            "mt-3 flex items-center gap-2 rounded-xl px-3 py-2",
            deadlinePast ? "bg-destructive/10" : "bg-amber-500/10",
          )}>
            <Clock className={cn("size-3.5 shrink-0", deadlinePast ? "text-destructive" : "text-amber-500")} />
            <p className={cn("text-xs font-medium", deadlinePast ? "text-destructive" : "text-amber-600 dark:text-amber-400")}>
              {deadlinePast ? "Payment deadline passed" : `Pay by ${paymentDeadlineDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
            </p>
          </div>
        )}

        {/* Actions */}
        {isAwaitingPayment && (
          <div className="mt-4 flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-ig text-white border-transparent hover:opacity-90 gap-1.5"
              onClick={() => refreshLink(escrow._id)}
              disabled={isRefreshing}
            >
              {isRefreshing ? <RefreshCw className="size-3.5 animate-spin" /> : <ExternalLink className="size-3.5" />}
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
              This will cancel the escrow and the bid acceptance. The creator will be notified. This action cannot be undone.
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

function EscrowSkeleton(): ReactElement {
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

export function BrandPaymentsPage(): ReactElement {
  const { data, isLoading } = useEscrows();

  const escrows = (data?.items ?? []) as EscrowBrandView[];
  const pending = escrows.filter((e) => e.status === EscrowStatus.AWAITING_PAYMENT);
  const active = escrows.filter((e) => e.status === EscrowStatus.FUNDED);
  const HISTORY_STATUSES: string[] = [EscrowStatus.RELEASED, EscrowStatus.REFUNDED, EscrowStatus.CANCELLED, EscrowStatus.DISPUTED];
  const history = escrows.filter((e) => HISTORY_STATUSES.includes(e.status));

  const totalSpent = escrows
    .filter((e) => e.status === EscrowStatus.RELEASED)
    .reduce((sum, e) => sum + e.totalChargedAmount, 0);

  const totalLocked = escrows
    .filter((e) => e.status === EscrowStatus.FUNDED)
    .reduce((sum, e) => sum + e.totalChargedAmount, 0);

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
        <div className="relative z-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1.5">
              <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
                <Sparkles className="mr-1 size-3" />
                Payments &amp; Escrow
              </Badge>
              <h1 className="text-3xl font-bold text-foreground">Payments</h1>
              <p className="text-sm text-muted-foreground">
                Manage your escrow payments, track fund status, and view payment history.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="size-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
              </div>
              <p className="text-xl font-bold text-foreground">{formatRupees(totalSpent)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">In Escrow</p>
              </div>
              <p className="text-xl font-bold text-foreground">{formatRupees(totalLocked)}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="size-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Pending Payment</p>
              </div>
              <p className="text-xl font-bold text-foreground">{pending.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="size-3.5" />
            Pending
            {pending.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{pending.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="active">
            <CheckCircle2 className="size-3.5 mr-1.5" />
            In Escrow
          </TabsTrigger>
          <TabsTrigger value="history">
            <ArrowUpRight className="size-3.5 mr-1.5" />
            History
          </TabsTrigger>
        </TabsList>

        {[
          { value: "pending", items: pending, emptyMsg: "No pending payments", emptySub: "When you accept a bid, you'll need to fund the escrow here." },
          { value: "active", items: active, emptyMsg: "No funds in escrow", emptySub: "Funded escrows appear here while the collab is in progress." },
          { value: "history", items: history, emptyMsg: "No payment history", emptySub: "Completed, refunded, and cancelled payments appear here." },
        ].map(({ value, items, emptyMsg, emptySub }) => (
          <TabsContent key={value} value={value} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <EscrowSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
                <CreditCard className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
                <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{emptySub}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => <EscrowCard key={e._id} escrow={e} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
