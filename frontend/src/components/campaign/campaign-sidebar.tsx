"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { MapPin, Globe, Repeat2, Clock, X, Rocket } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import type { Campaign } from "@/types/campaign.types";
import { CampaignStatus, CampaignPlatform, CampaignDeliveryType } from "@/types/campaign.types";
import { PLATFORM_LABEL, DELIVERY_TYPE_LABEL } from "@/config/campaign.config";
import { ROUTES } from "@/config/routes.config";
import { formatDate } from "@/lib/formatters";

type CampaignSidebarProps = {
  campaign: Campaign;
  hasAcceptedBid: boolean;
  isPendingAction: boolean;
  onPublish: () => void;
};

export function CampaignSidebar({
  campaign,
  hasAcceptedBid,
  isPendingAction,
  onPublish,
}: CampaignSidebarProps): ReactElement {
  const isIG =
    campaign.platform === CampaignPlatform.INSTAGRAM ||
    campaign.platform === CampaignPlatform.BOTH;
  const isYT =
    campaign.platform === CampaignPlatform.YOUTUBE ||
    campaign.platform === CampaignPlatform.BOTH;

  const platformIcon =
    isIG && isYT ? (
      <span className="flex gap-0.5">
        <FaInstagram className="size-3.5" />
        <FaYoutube className="size-3.5" />
      </span>
    ) : isIG ? (
      <FaInstagram className="size-3.5" />
    ) : (
      <FaYoutube className="size-3.5" />
    );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Campaign Details</h3>
        <div className="space-y-3">
          <SidebarRow
            icon={platformIcon}
            label="Platform"
            value={PLATFORM_LABEL[campaign.platform]}
          />
          <SidebarRow
            icon={
              campaign.deliveryType === CampaignDeliveryType.ONSITE ? (
                <MapPin className="size-3.5" />
              ) : (
                <Globe className="size-3.5" />
              )
            }
            label="Delivery"
            value={DELIVERY_TYPE_LABEL[campaign.deliveryType]}
          />
          {campaign.shootingLocation && (
            <SidebarRow
              icon={<MapPin className="size-3.5" />}
              label="Shooting Radius"
              value={`Within ${campaign.shootingLocation.radiusKm ?? "?"}km`}
            />
          )}
          <SidebarRow
            icon={<Repeat2 className="size-3.5" />}
            label="Revisions"
            value={`${campaign.revisionRounds} round${campaign.revisionRounds > 1 ? "s" : ""}`}
          />
          <SidebarRow
            icon={<Clock className="size-3.5" />}
            label="Created"
            value={formatDate(campaign.createdAt)}
          />
          {campaign.closedAt && (
            <SidebarRow
              icon={<X className="size-3.5" />}
              label="Closed"
              value={formatDate(campaign.closedAt)}
            />
          )}
        </div>
      </div>

      {campaign.status === CampaignStatus.DRAFT && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
            Draft — Not visible to creators
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Publish this campaign to start receiving bids from creators.
          </p>
          <button
            type="button"
            onClick={onPublish}
            disabled={isPendingAction}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gradient-ig px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Rocket className="size-3" />
            Publish Now
          </button>
        </div>
      )}

      {campaign.status === CampaignStatus.ACTIVE && hasAcceptedBid && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Creator accepted
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            An escrow has been created. Head to Collabs to manage the collaboration.
          </p>
          <Link
            href={ROUTES.brand.collabs}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Go to Collabs →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Micro sub-component (used only by CampaignSidebar) ───────────────────────

type SidebarRowProps = { icon: ReactElement; label: string; value: string };

function SidebarRow({ icon, label, value }: SidebarRowProps): ReactElement {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
