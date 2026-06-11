"use client";

import type { ReactElement, ReactNode } from "react";
import { Users } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import type { Campaign } from "@/types/campaign.types";
import { CampaignPlatform } from "@/types/campaign.types";
import { GENDER_LABEL } from "@/config/campaign.config";

type CampaignRequirementsProps = {
  campaign: Campaign;
};

export function CampaignRequirements({ campaign }: CampaignRequirementsProps): ReactElement {
  const req = campaign.creatorRequirements;
  const isIG =
    campaign.platform === CampaignPlatform.INSTAGRAM ||
    campaign.platform === CampaignPlatform.BOTH;
  const isYT =
    campaign.platform === CampaignPlatform.YOUTUBE ||
    campaign.platform === CampaignPlatform.BOTH;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="mb-5 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
          <Users className="size-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Creator Requirements</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <RequirementGroup label="Audience">
          <RequirementRow
            label="Age Range"
            value={`${campaign.targetAgeMin}–${campaign.targetAgeMax} yrs`}
          />
          <RequirementRow label="Gender" value={GENDER_LABEL[campaign.targetGender]} />
          <RequirementRow label="Location" value={campaign.targetLocation} />
          {req.languages && req.languages.length > 0 && (
            <RequirementRow label="Languages" value={req.languages.join(", ")} />
          )}
        </RequirementGroup>

        {isIG && req.instagram && (
          <RequirementGroup label="Instagram" icon={<FaInstagram className="size-2.5" />}>
            {req.instagram.minFollowers !== undefined && (
              <RequirementRow
                label="Followers"
                value={`${req.instagram.minFollowers.toLocaleString("en-IN")}${req.instagram.maxFollowers ? `–${req.instagram.maxFollowers.toLocaleString("en-IN")}` : "+"}`}
              />
            )}
            {req.instagram.minEngagementRate !== undefined && (
              <RequirementRow
                label="Engagement"
                value={`≥ ${req.instagram.minEngagementRate}%`}
              />
            )}
            {req.instagram.minAvgReelViews !== undefined && (
              <RequirementRow
                label="Avg. Reel Views"
                value={`≥ ${req.instagram.minAvgReelViews.toLocaleString("en-IN")}`}
              />
            )}
            {req.instagram.minPostsPerMonth !== undefined && (
              <RequirementRow
                label="Posts/Month"
                value={`≥ ${req.instagram.minPostsPerMonth}`}
              />
            )}
          </RequirementGroup>
        )}

        {isYT && req.youtube && (
          <RequirementGroup label="YouTube" icon={<FaYoutube className="size-2.5" />}>
            {req.youtube.minSubscribers !== undefined && (
              <RequirementRow
                label="Subscribers"
                value={`${req.youtube.minSubscribers.toLocaleString("en-IN")}${req.youtube.maxSubscribers ? `–${req.youtube.maxSubscribers.toLocaleString("en-IN")}` : "+"}`}
              />
            )}
            {req.youtube.minAvgVideoViews !== undefined && (
              <RequirementRow
                label="Avg. Views"
                value={`≥ ${req.youtube.minAvgVideoViews.toLocaleString("en-IN")}`}
              />
            )}
            {req.youtube.minVideosPerMonth !== undefined && (
              <RequirementRow
                label="Videos/Month"
                value={`≥ ${req.youtube.minVideosPerMonth}`}
              />
            )}
          </RequirementGroup>
        )}
      </div>
    </div>
  );
}

// ── Micro sub-components (used only by CampaignRequirements) ──────────────────

type RequirementGroupProps = {
  label: string;
  icon?: ReactElement;
  children: ReactNode;
};

function RequirementGroup({ label, icon, children }: RequirementGroupProps): ReactElement {
  return (
    <div className="rounded-xl bg-muted/40 p-4 space-y-2.5">
      <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      {children}
    </div>
  );
}

type RequirementRowProps = { label: string; value: string };

function RequirementRow({ label, value }: RequirementRowProps): ReactElement {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
      <span className="truncate text-right text-[11px] font-medium text-foreground">{value}</span>
    </div>
  );
}
