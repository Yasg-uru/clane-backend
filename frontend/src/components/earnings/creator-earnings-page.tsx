"use client";

import type { ReactElement } from "react";
import {
  Wallet,
  IndianRupee,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Banknote,
  Lock,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientOrb } from "@/components/common/gradient-orb";
import { useEscrows } from "@/hooks/payment/usePayments";
import { EscrowStatus } from "@/types/payment.types";
import type { EscrowCreatorView } from "@/types/payment.types";
import { CREATOR_ESCROW_STATUS_CONFIG } from "@/config/status.config";
import { formatRupees } from "@/lib/formatters";
import { cn } from "@/lib/utils";

function StatCard({ icon, label, value, sub, highlight }: {
  icon: ReactElement;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}): ReactElement {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-5 transition-all",
      highlight ? "border-transparent" : "border-border/60 bg-card",
    )}>
      {highlight && <div className="absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.08]" />}
      <div className="relative z-10">
        <div className={cn(
          "flex size-10 items-center justify-center rounded-xl",
          highlight ? "bg-gradient-ig text-white" : "bg-muted text-muted-foreground",
        )}>
          {icon}
        </div>
        <p className="mt-4 text-2xl font-bold text-foreground">{value}</p>
        <p className="mt-0.5 text-sm font-medium text-muted-foreground">{label}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );
}

type EarningsCardProps = { escrow: EscrowCreatorView };

function EarningsCard({ escrow }: EarningsCardProps): ReactElement {
  const config = CREATOR_ESCROW_STATUS_CONFIG[escrow.status] ?? CREATOR_ESCROW_STATUS_CONFIG[EscrowStatus.FUNDED];
  const isPaidOut = escrow.status === EscrowStatus.RELEASED;
  const isInEscrow = escrow.status === EscrowStatus.FUNDED;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-md",
      isPaidOut ? "border-emerald-500/40" : isInEscrow ? "border-blue-500/30" : "border-border/60",
    )}>
      {isPaidOut && <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-2xl" />}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex size-10 items-center justify-center rounded-xl shrink-0",
            isPaidOut ? "bg-emerald-500/15 text-emerald-500" : isInEscrow ? "bg-blue-500/15 text-blue-500" : "bg-muted text-muted-foreground",
          )}>
            {isPaidOut ? <Banknote className="size-4.5" /> : isInEscrow ? <Lock className="size-4.5" /> : <Clock className="size-4.5" />}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground font-mono">#{escrow._id.slice(-8)}</p>
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
          <p className="text-sm font-bold text-foreground flex items-center gap-0.5">
            <IndianRupee className="size-3" />
            {(escrow.agreedAmount / 100).toLocaleString("en-IN")}
          </p>
        </div>
        <div className={cn("rounded-xl p-3", isPaidOut ? "bg-emerald-500/10" : "bg-muted/50")}>
          <p className="text-[11px] text-muted-foreground mb-0.5">You Receive</p>
          <p className={cn("text-sm font-bold flex items-center gap-0.5", isPaidOut ? "text-emerald-500" : "text-foreground")}>
            <IndianRupee className="size-3" />
            {(escrow.creatorReceivableAmount / 100).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Dates */}
      <div className="mt-3 text-[11px] text-muted-foreground/70 space-y-0.5">
        {escrow.fundedAt && (
          <p>Funded: {new Date(escrow.fundedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
        )}
        {escrow.releasedAt && (
          <p className="text-emerald-500 font-medium">
            Paid: {new Date(escrow.releasedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}

function EarningsSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function CreatorEarningsPage(): ReactElement {
  const { data, isLoading } = useEscrows();
  const escrows = (data?.items ?? []) as EscrowCreatorView[];

  const totalEarned = escrows
    .filter((e) => e.status === EscrowStatus.RELEASED)
    .reduce((sum, e) => sum + e.creatorReceivableAmount, 0);

  const totalInEscrow = escrows
    .filter((e) => e.status === EscrowStatus.FUNDED)
    .reduce((sum, e) => sum + e.creatorReceivableAmount, 0);

  const pendingCount = escrows.filter((e) => e.status === EscrowStatus.AWAITING_PAYMENT).length;
  const inEscrowItems = escrows.filter((e) => e.status === EscrowStatus.FUNDED);
  const HISTORY_STATUSES: string[] = [EscrowStatus.RELEASED, EscrowStatus.REFUNDED, EscrowStatus.CANCELLED, EscrowStatus.DISPUTED];
  const historyItems = escrows.filter((e) => HISTORY_STATUSES.includes(e.status));

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
        <GradientOrb color="to" className="-bottom-32 right-0 h-[400px] w-[400px] opacity-[0.04] blur-[110px]" />
      </div>

      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-7 md:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-3xl bg-gradient-ig opacity-[0.05]" />
          <GradientOrb color="from" className="-right-20 -top-16 h-[280px] w-[280px] opacity-[0.10] blur-[70px]" />
        </div>
        <div className="relative z-10 space-y-1.5">
          <Badge className="bg-gradient-ig text-white border-transparent text-xs font-semibold px-2.5">
            <Sparkles className="mr-1 size-3" />
            Earnings
          </Badge>
          <h1 className="text-3xl font-bold text-foreground">Your Earnings</h1>
          <p className="text-sm text-muted-foreground">
            Track your campaign earnings, escrow status, and payment history.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 space-y-3">
              <Skeleton className="size-10 rounded-xl" />
              <Skeleton className="h-7 w-24 rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))
        ) : (
          <>
            <StatCard icon={<Wallet className="size-5" />} label="Total Earned" value={formatRupees(totalEarned)} sub="All time" highlight />
            <StatCard icon={<Lock className="size-5" />} label="In Escrow" value={formatRupees(totalInEscrow)} sub="Locked until approval" />
            <StatCard icon={<TrendingUp className="size-5" />} label="Completed" value={historyItems.filter((e) => e.status === EscrowStatus.RELEASED).length.toString()} sub="Paid collabs" />
            <StatCard icon={<Clock className="size-5" />} label="Pending" value={pendingCount.toString()} sub="Brand payment pending" />
          </>
        )}
      </section>

      {/* Tabs */}
      <Tabs defaultValue="escrow">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="escrow" className="gap-1.5">
            <Lock className="size-3.5" />
            In Escrow
            {inEscrowItems.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{inEscrowItems.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle2 className="size-3.5 mr-1.5" />
            History
          </TabsTrigger>
        </TabsList>

        {[
          { value: "escrow", items: inEscrowItems, emptyMsg: "No funds in escrow", emptySub: "Funds appear here after the brand pays. They are held safely until your content is approved." },
          { value: "history", items: historyItems, emptyMsg: "No payment history", emptySub: "Completed, refunded, and cancelled payments will appear here." },
        ].map(({ value, items, emptyMsg, emptySub }) => (
          <TabsContent key={value} value={value} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <EarningsSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
                <Wallet className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
                <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{emptySub}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((e) => <EarningsCard key={e._id} escrow={e} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
