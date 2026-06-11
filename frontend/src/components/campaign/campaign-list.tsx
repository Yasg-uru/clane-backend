"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Plus, Megaphone, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { CampaignCard } from "./campaign-card";
import { useBrandCampaigns } from "@/hooks/campaign/useCampaigns";
import { ROUTES } from "@/config/routes.config";
import { CampaignStatus } from "@/types/campaign.types";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FILTER_TABS = [
  { label: "All", value: undefined },
  { label: "Active", value: CampaignStatus.ACTIVE },
  { label: "Draft", value: CampaignStatus.DRAFT },
  { label: "In Progress", value: CampaignStatus.IN_PROGRESS },
  { label: "Completed", value: CampaignStatus.COMPLETED },
  { label: "Closed", value: CampaignStatus.CLOSED },
] as const;

export function CampaignList(): ReactElement {
  const [activeFilter, setActiveFilter] = useState<CampaignStatus | undefined>(undefined);
  const { data, isLoading, isError } = useBrandCampaigns({ status: activeFilter });

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            My <span className="text-gradient-ig">Campaigns</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data ? `${data.total} campaign${data.total !== 1 ? "s" : ""}` : "Manage your campaigns"}
          </p>
        </div>
        <Link
          href={`${ROUTES.brand.campaigns}/create`}
          className={cn(
            buttonVariants(),
            "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90",
          )}
        >
          <Plus className="size-4" />
          New Campaign
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="size-3.5 text-muted-foreground shrink-0" />
        {FILTER_TABS.map((tab) => (
          <button
            key={String(tab.value)}
            type="button"
            onClick={() => setActiveFilter(tab.value as CampaignStatus | undefined)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap border transition-all",
              activeFilter === tab.value
                ? "bg-gradient-ig text-white border-transparent shadow-sm"
                : "border-border bg-muted/40 text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Separator />

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 py-12 text-center">
          <p className="text-sm font-medium text-destructive">Failed to load campaigns</p>
          <p className="text-xs text-muted-foreground">Please refresh the page to try again.</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && data?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/70 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-ig text-white shadow-lg">
            <Megaphone className="size-7" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">
              {activeFilter ? `No ${activeFilter} campaigns` : "No campaigns yet"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-xs">
              {activeFilter
                ? "Try a different filter or create a new campaign."
                : "Create your first campaign and start receiving bids from verified creators."}
            </p>
          </div>
          <Link
            href={`${ROUTES.brand.campaigns}/create`}
            className={cn(
              buttonVariants(),
              "gap-2 bg-gradient-ig text-white border-transparent hover:opacity-90",
            )}
          >
            <Plus className="size-4" />
            Create Campaign
          </Link>
        </div>
      )}

      {/* Campaign grid */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((campaign) => (
            <CampaignCard key={campaign._id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* Pagination hint */}
      {data && data.totalPages > 1 && (
        <p className="text-center text-xs text-muted-foreground">
          Showing {data.items.length} of {data.total} campaigns
        </p>
      )}
    </div>
  );
}
