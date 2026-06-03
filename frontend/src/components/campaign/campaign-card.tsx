"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  Calendar,
  IndianRupee,
  Gavel,
  ArrowRight,
  MoreVertical,
  Rocket,
  EyeOff,
  X,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { buttonVariants } from "@/components/ui/button";
import {
  usePublishCampaign,
  useUnpublishCampaign,
  useCloseCampaign,
} from "@/hooks/campaign/useCampaigns";
import type { Campaign } from "@/types/campaign.types";
import { CampaignStatus, CampaignPlatform } from "@/types/campaign.types";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: "bg-muted text-muted-foreground border-border",
  [CampaignStatus.ACTIVE]: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
  [CampaignStatus.CLOSED]: "bg-muted text-muted-foreground border-border",
  [CampaignStatus.IN_PROGRESS]: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  [CampaignStatus.COMPLETED]: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  [CampaignStatus.DRAFT]: "Draft",
  [CampaignStatus.ACTIVE]: "Active",
  [CampaignStatus.CLOSED]: "Closed",
  [CampaignStatus.IN_PROGRESS]: "In Progress",
  [CampaignStatus.COMPLETED]: "Completed",
};

type CampaignCardProps = {
  campaign: Campaign;
};

export function CampaignCard({ campaign }: CampaignCardProps): ReactElement {
  const { mutate: publish, isPending: isPublishing } = usePublishCampaign();
  const { mutate: unpublish, isPending: isUnpublishing } = useUnpublishCampaign();
  const { mutate: close, isPending: isClosing } = useCloseCampaign();

  const isPending = isPublishing || isUnpublishing || isClosing;

  const isInstagram = campaign.platform === CampaignPlatform.INSTAGRAM;
  const isYouTube = campaign.platform === CampaignPlatform.YOUTUBE;

  const deadlineDate = new Date(campaign.deadline);
  const daysLeft = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isExpired = daysLeft < 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:shadow-md hover:border-border">
      {/* Header strip */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <Badge
              className={cn(
                "text-[10px] font-semibold px-2 py-0.5 border",
                STATUS_STYLE[campaign.status],
              )}
              variant="outline"
            >
              {STATUS_LABEL[campaign.status]}
            </Badge>
            <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-0.5">
              {isInstagram ? (
                <FaInstagram className="size-3 text-muted-foreground" />
              ) : isYouTube ? (
                <FaYoutube className="size-3 text-muted-foreground" />
              ) : (
                <>
                  <FaInstagram className="size-3 text-muted-foreground" />
                  <FaYoutube className="size-3 text-muted-foreground" />
                </>
              )}
              <span className="text-[10px] text-muted-foreground font-medium">
                {campaign.platform === "both" ? "IG + YT" : campaign.platform === "instagram" ? "Instagram" : "YouTube"}
              </span>
            </div>
          </div>
          <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-1">
            {campaign.title}
          </h3>
        </div>

        {/* Actions menu */}
        <Popover>
          <PopoverTrigger className="flex size-7 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground hover:bg-muted transition-colors shrink-0 cursor-pointer">
            <MoreVertical className="size-3.5" />
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1.5" align="end" sideOffset={6}>
            {campaign.status === CampaignStatus.DRAFT && (
              <button
                type="button"
                onClick={() => publish(campaign._id)}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <Rocket className="size-3.5 text-emerald-500" />
                Publish
              </button>
            )}
            {campaign.status === CampaignStatus.ACTIVE && (
              <button
                type="button"
                onClick={() => unpublish(campaign._id)}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
              >
                <EyeOff className="size-3.5 text-muted-foreground" />
                Unpublish
              </button>
            )}
            {(campaign.status === CampaignStatus.ACTIVE ||
              campaign.status === CampaignStatus.DRAFT) && (
              <button
                type="button"
                onClick={() => close(campaign._id)}
                disabled={isPending}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <X className="size-3.5" />
                Close Campaign
              </button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Niche tags */}
      <div className="flex flex-wrap gap-1 px-5 pb-3">
        {campaign.niche.slice(0, 3).map((n) => (
          <Badge key={n} variant="secondary" className="text-[10px] px-2 py-0.5">
            {n}
          </Badge>
        ))}
        {campaign.niche.length > 3 && (
          <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
            +{campaign.niche.length - 3}
          </Badge>
        )}
      </div>

      <Separator />

      {/* Stats */}
      <div className="flex items-center gap-4 px-5 py-3 text-xs">
        <div className="flex items-center gap-1 font-semibold text-foreground">
          <IndianRupee className="size-3" />
          {campaign.budgetAmount.toLocaleString("en-IN")}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Calendar className="size-3" />
          {isExpired ? (
            <span className="text-destructive">Expired</span>
          ) : (
            <span>{daysLeft}d left</span>
          )}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground ml-auto">
          <Gavel className="size-3" />
          {campaign.totalBids} bid{campaign.totalBids !== 1 ? "s" : ""}
        </div>
      </div>

      <Separator />

      {/* Footer CTA */}
      <div className="px-5 py-3">
        <Link
          href={`${ROUTES.brand.campaigns}/${campaign._id}`}
          className={cn(
            buttonVariants({ size: "sm", variant: "ghost" }),
            "w-full justify-between text-muted-foreground hover:text-foreground text-xs",
          )}
        >
          View details
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
