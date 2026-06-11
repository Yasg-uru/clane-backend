"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, EyeOff, X } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Campaign } from "@/types/campaign.types";
import { CampaignStatus, CampaignPlatform } from "@/types/campaign.types";
import { CAMPAIGN_STATUS_CONFIG } from "@/config/status.config";
import { PLATFORM_LABEL } from "@/config/campaign.config";
import { ROUTES } from "@/config/routes.config";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type CampaignHeaderProps = {
  campaign: Campaign;
  isPendingAction: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onCloseRequest: () => void;
};

export function CampaignHeader({
  campaign,
  isPendingAction,
  onPublish,
  onUnpublish,
  onCloseRequest,
}: CampaignHeaderProps): ReactElement {
  const statusCfg = CAMPAIGN_STATUS_CONFIG[campaign.status];
  const isIG =
    campaign.platform === CampaignPlatform.INSTAGRAM ||
    campaign.platform === CampaignPlatform.BOTH;
  const isYT =
    campaign.platform === CampaignPlatform.YOUTUBE ||
    campaign.platform === CampaignPlatform.BOTH;
  const canClose =
    campaign.status === CampaignStatus.DRAFT ||
    campaign.status === CampaignStatus.ACTIVE;

  return (
    <div className="space-y-4">
      <Link
        href={ROUTES.brand.campaigns}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to Campaigns
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn("border px-2.5 py-1 text-xs font-semibold", statusCfg.style)}
            >
              {statusCfg.label}
            </Badge>
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {isIG && <FaInstagram className="size-3" />}
              {isYT && <FaYoutube className="size-3" />}
              <span>{PLATFORM_LABEL[campaign.platform]}</span>
            </div>
            {campaign.publishedAt && (
              <span className="text-xs text-muted-foreground">
                Published {formatDate(campaign.publishedAt)}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {campaign.title}
          </h1>

          <div className="flex flex-wrap items-center gap-1.5">
            {campaign.niche.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          {campaign.status === CampaignStatus.DRAFT && (
            <Button
              size="sm"
              className="gap-1.5 border-transparent bg-gradient-ig text-white hover:opacity-90"
              onClick={onPublish}
              disabled={isPendingAction}
            >
              <Rocket className="size-3.5" />
              Publish Campaign
            </Button>
          )}
          {campaign.status === CampaignStatus.ACTIVE && (
            <Button
              size="sm"
              variant="outline"
              onClick={onUnpublish}
              disabled={isPendingAction}
            >
              <EyeOff className="size-3.5" />
              Unpublish
            </Button>
          )}
          {canClose && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/40 text-destructive hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive"
              onClick={onCloseRequest}
              disabled={isPendingAction}
            >
              <X className="size-3.5" />
              Close Campaign
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
