"use client";

import type { ReactElement } from "react";
import {
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradientOrb } from "@/components/common/gradient-orb";
import { PageHero } from "@/components/common/page-hero";
import { EmptyState } from "@/components/common/empty-state";
import { EscrowCard, EscrowSkeleton } from "@/components/payment/escrow-card";
import { useEscrows } from "@/hooks/payment/usePayments";
import { EscrowStatus } from "@/types/payment.types";
import type { EscrowBrandView } from "@/types/payment.types";
import { formatRupees } from "@/lib/formatters";

const HISTORY_STATUSES: string[] = [
  EscrowStatus.RELEASED,
  EscrowStatus.REFUNDED,
  EscrowStatus.CANCELLED,
  EscrowStatus.DISPUTED,
];

export function BrandPaymentsPage(): ReactElement {
  const { data, isLoading } = useEscrows();

  const escrows = (data?.items ?? []) as EscrowBrandView[];
  const pending = escrows.filter((e) => e.status === EscrowStatus.AWAITING_PAYMENT);
  const active = escrows.filter((e) => e.status === EscrowStatus.FUNDED);
  const history = escrows.filter((e) => HISTORY_STATUSES.includes(e.status));

  const totalSpent = escrows
    .filter((e) => e.status === EscrowStatus.RELEASED)
    .reduce((sum, e) => sum + e.totalChargedAmount, 0);

  const totalLocked = escrows
    .filter((e) => e.status === EscrowStatus.FUNDED)
    .reduce((sum, e) => sum + e.totalChargedAmount, 0);

  const tabConfig = [
    { value: "pending", items: pending, emptyTitle: "No pending payments", emptySub: "When you accept a bid, you'll need to fund the escrow here." },
    { value: "active", items: active, emptyTitle: "No funds in escrow", emptySub: "Funded escrows appear here while the collab is in progress." },
    { value: "history", items: history, emptyTitle: "No payment history", emptySub: "Completed, refunded, and cancelled payments appear here." },
  ];

  return (
    <div className="relative space-y-8">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb color="from" className="-left-40 -top-20 h-[500px] w-[500px] opacity-[0.05] blur-[130px]" />
      </div>

      <PageHero
        badge="Payments & Escrow"
        title="Payments"
        subtitle="Manage your escrow payments, track fund status, and view payment history."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
      </PageHero>

      <Tabs defaultValue="pending">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="size-3.5" />
            Pending
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">
                {pending.length}
              </Badge>
            )}
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

        {tabConfig.map(({ value, items, emptyTitle, emptySub }) => (
          <TabsContent key={value} value={value} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <EscrowSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <EmptyState icon={<CreditCard className="size-10" />} title={emptyTitle} subtitle={emptySub} />
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
