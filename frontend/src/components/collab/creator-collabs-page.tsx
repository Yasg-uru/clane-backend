"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Handshake,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { COLLAB_STATUS_CONFIG, ACTIVE_COLLAB_STATUSES } from "@/config/status.config";
import { formatDeadline } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type CollabCardProps = {
  collab: CollabRoom;
  onClick: (collab: CollabRoom) => void;
};

function CreatorCollabCard({ collab, onClick }: CollabCardProps): ReactElement {
  const config = COLLAB_STATUS_CONFIG[collab.status] ?? COLLAB_STATUS_CONFIG[CollabRoomStatus.ACTIVE];
  const { text: deadlineText, isOverdue } = formatDeadline(collab.collabDeadline);
  const isRevision = collab.status === CollabRoomStatus.REVISION_REQUESTED;
  const isApproved = collab.status === CollabRoomStatus.APPROVED;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-5 transition-all hover:shadow-md cursor-pointer",
        isApproved ? "border-emerald-500/40" : isRevision ? "border-orange-500/40" : "border-border/60 hover:border-border",
      )}
      onClick={() => onClick(collab)}
    >
      {isApproved && <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-2xl" />}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {collab.campaignTitle ?? `Campaign #${collab.campaignId.slice(-6)}`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {collab.brandName ?? "Brand"}
          </p>
        </div>
        <Badge variant={config.variant} className="shrink-0 flex items-center gap-1 text-[11px]">
          <config.Icon className={config.iconClass} />
          {config.label}
        </Badge>
      </div>

      {/* Progress bar (revisions used) */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Revisions</span>
          <span>{collab.revisionCount} / {collab.maxRevisions} used</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-ig transition-all"
            style={{ width: `${Math.min(100, (collab.revisionCount / collab.maxRevisions) * 100)}%` }}
          />
        </div>
      </div>

      {/* Deadline */}
      <div className={cn(
        "mt-3 flex items-center gap-2 rounded-xl px-3 py-2",
        isOverdue ? "bg-destructive/10" : "bg-muted/50",
      )}>
        <Clock className={cn("size-3.5 shrink-0", isOverdue ? "text-destructive" : "text-muted-foreground")} />
        <p className={cn("text-xs font-medium", isOverdue ? "text-destructive" : "text-muted-foreground")}>
          {deadlineText}
        </p>
        <span className="text-muted-foreground/40 text-xs">·</span>
        <p className="text-xs text-muted-foreground/70">
          {new Date(collab.collabDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground/60">{config.description}</p>
        <ChevronRight className="size-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0 ml-2" />
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
          <div className="rounded-xl bg-muted/30 p-3 text-sm text-muted-foreground">{config.description}</div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Brand", value: collab.brandName ?? "—" },
              { label: "Deadline", value: new Date(collab.collabDeadline).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
              { label: "Revisions Used", value: `${collab.revisionCount} / ${collab.maxRevisions}` },
              { label: "Started", value: new Date(collab.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-semibold text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border/60 p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reference IDs</p>
            <p className="text-[11px] font-mono text-muted-foreground">Room: {collab._id}</p>
            <p className="text-[11px] font-mono text-muted-foreground">Escrow: {collab.escrowId}</p>
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
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-5 w-28 rounded-full" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-32 rounded" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Skeleton className="h-9 rounded-xl" />
    </div>
  );
}

export function CreatorCollabsPage(): ReactElement {
  const [selectedCollab, setSelectedCollab] = useState<CollabRoom | null>(null);
  const { data, isLoading } = useMyCollabRooms();

  const collabs = data?.items ?? [];
  const activeCollabs = collabs.filter((c) => ACTIVE_COLLAB_STATUSES.includes(c.status));
  const completedCollabs = collabs.filter((c) => !ACTIVE_COLLAB_STATUSES.includes(c.status));

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
              Manage your active collaborations, track deliverables, and monitor revision requests.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
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

      <Tabs defaultValue="active">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="active" className="gap-1.5">
            <Handshake className="size-3.5" />
            Active
            {activeCollabs.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px]">{activeCollabs.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="done">
            <CheckCircle2 className="size-3.5 mr-1.5" />
            Done
          </TabsTrigger>
        </TabsList>

        {[
          { value: "active", items: activeCollabs, emptyMsg: "No active collabs", emptySub: "When a brand accepts your bid and funds escrow, your collab room will appear here." },
          { value: "done", items: completedCollabs, emptyMsg: "No completed collabs", emptySub: "Completed collaborations will appear here." },
        ].map(({ value, items, emptyMsg, emptySub }) => (
          <TabsContent key={value} value={value} className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => <CollabSkeleton key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
                <Handshake className="size-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">{emptyMsg}</p>
                <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{emptySub}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((c) => (
                  <CreatorCollabCard key={c._id} collab={c} onClick={setSelectedCollab} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <CollabDetailModal
        collab={selectedCollab}
        open={Boolean(selectedCollab)}
        onClose={() => setSelectedCollab(null)}
      />
    </div>
  );
}
