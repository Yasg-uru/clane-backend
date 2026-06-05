"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Handshake,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientOrb } from "@/components/common/gradient-orb";
import { useMyCollabRooms } from "@/hooks/collab/useCollabs";
import { CollabRoomStatus } from "@/types/collab.types";
import type { CollabRoom } from "@/types/collab.types";
import {
  COLLAB_STATUS_CONFIG,
  ACTIVE_COLLAB_STATUSES,
  COMPLETED_COLLAB_STATUSES,
} from "@/config/status.config";
import { formatDeadline } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type CollabCardProps = {
  collab: CollabRoom;
  onClick: (collab: CollabRoom) => void;
};

function CollabCard({ collab, onClick }: CollabCardProps): ReactElement {
  const config = COLLAB_STATUS_CONFIG[collab.status] ?? COLLAB_STATUS_CONFIG[CollabRoomStatus.ACTIVE];
  const isOverdue = new Date(collab.collabDeadline) < new Date();

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border cursor-pointer"
      onClick={() => onClick(collab)}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-0 group-hover:opacity-[0.02] transition-opacity" />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {collab.campaignTitle ?? `Campaign #${collab.campaignId.slice(-6)}`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {collab.creatorName ?? "Creator"} · {collab.creatorHandle ?? ""}
          </p>
        </div>
        <Badge variant={config.variant} className="shrink-0 flex items-center gap-1 text-[11px]">
          <config.Icon className={config.iconClass} />
          {config.label}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/50 px-2 py-2">
          <p className="text-sm font-bold text-foreground">{collab.revisionCount}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">revisions used</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2 py-2">
          <p className="text-sm font-bold text-foreground">{collab.maxRevisions}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">max revisions</p>
        </div>
        <div className={cn("rounded-xl px-2 py-2", isOverdue ? "bg-destructive/10" : "bg-muted/50")}>
          <p className={cn("text-sm font-bold", isOverdue ? "text-destructive" : "text-foreground")}>
            {formatDeadline(collab.collabDeadline).text}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">deadline</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/60">
          Started {new Date(collab.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
        <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
      </div>
    </div>
  );
}

function CollabDetailModal({ collab, open, onClose }: { collab: CollabRoom | null; open: boolean; onClose: () => void }): ReactElement {
  if (!collab) return <></>;
  const config = COLLAB_STATUS_CONFIG[collab.status] ?? COLLAB_STATUS_CONFIG[CollabRoomStatus.ACTIVE];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {collab.campaignTitle ?? `Campaign #${collab.campaignId.slice(-6)}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} className="flex items-center gap-1">
              <config.Icon className={config.iconClass} />
              {config.label}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Creator", value: collab.creatorName ?? "—" },
              { label: "Handle", value: collab.creatorHandle ?? "—" },
              { label: "Revisions Used", value: `${collab.revisionCount} / ${collab.maxRevisions}` },
              { label: "Deadline", value: new Date(collab.collabDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Started", value: new Date(collab.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collab IDs</p>
            <div className="space-y-1">
              <p className="text-[11px] text-muted-foreground font-mono">Room: {collab._id}</p>
              <p className="text-[11px] text-muted-foreground font-mono">Bid: {collab.bidId}</p>
              <p className="text-[11px] text-muted-foreground font-mono">Escrow: {collab.escrowId}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollabSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
      </div>
      <Skeleton className="h-3 w-24 rounded" />
    </div>
  );
}

export function BrandCollabsPage(): ReactElement {
  const [selectedCollab, setSelectedCollab] = useState<CollabRoom | null>(null);
  const { data, isLoading } = useMyCollabRooms();

  const collabs = data?.items ?? [];
  const activeCollabs = collabs.filter((c) => ACTIVE_COLLAB_STATUSES.includes(c.status));
  const completedCollabs = collabs.filter((c) => COMPLETED_COLLAB_STATUSES.includes(c.status));

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
              Collaborations
            </Badge>
            <h1 className="text-3xl font-bold text-foreground">Your Collabs</h1>
            <p className="text-sm text-muted-foreground">
              Track your active collaborations, review content, and manage deliverables.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{activeCollabs.length}</p>
              <p className="text-xs text-muted-foreground">active</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 px-5 py-3 text-center">
              <p className="text-2xl font-bold text-foreground">{completedCollabs.length}</p>
              <p className="text-xs text-muted-foreground">completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="gap-1.5">
            <Handshake className="size-3.5" />
            Active
            {activeCollabs.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{activeCollabs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle2 className="size-3.5 mr-1.5" />
            Completed
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <CollabSkeleton key={i} />)}
            </div>
          ) : activeCollabs.length === 0 ? (
            <EmptyCollabs message="No active collaborations yet" sub="Accept a bid from your campaigns to start working with a creator." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCollabs.map((c) => (
                <CollabCard key={c._id} collab={c} onClick={setSelectedCollab} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1].map((i) => <CollabSkeleton key={i} />)}
            </div>
          ) : completedCollabs.length === 0 ? (
            <EmptyCollabs message="No completed collaborations" sub="Completed collabs will appear here once they're done." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedCollabs.map((c) => (
                <CollabCard key={c._id} collab={c} onClick={setSelectedCollab} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CollabDetailModal
        collab={selectedCollab}
        open={Boolean(selectedCollab)}
        onClose={() => setSelectedCollab(null)}
      />
    </div>
  );
}

function EmptyCollabs({ message, sub }: { message: string; sub: string }): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
      <Handshake className="size-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{sub}</p>
    </div>
  );
}
