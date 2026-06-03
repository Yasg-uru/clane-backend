"use client";

import type { ReactElement } from "react";
import {
  ArrowLeft,
  Loader2,
  Megaphone,
  Calendar,
  IndianRupee,
  Users,
  FileText,
  MapPin,
  RotateCcw,
  Rocket,
  BookmarkCheck,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import {
  useCreateCampaign,
  useCreateAndPublishCampaign,
} from "@/hooks/campaign/useCampaigns";
import {
  CampaignPlatform,
  CampaignDeliveryType,
  TargetGender,
} from "@/types/campaign.types";
import type { ICreateCampaignPayload } from "@/domain/campaign/ICampaignRepository";
import type { CampaignWizardData } from "@/types/campaign.types";
import { cn } from "@/lib/utils";

function buildPayload(data: CampaignWizardData): ICreateCampaignPayload {
  const payload: ICreateCampaignPayload = {
    title: data.title,
    platform: data.platform,
    niche: data.niche,
    targetLocation: data.targetLocation,
    targetAgeMin: data.targetAgeMin,
    targetAgeMax: data.targetAgeMax,
    targetGender: data.targetGender,
    budgetAmount: data.budgetAmount,
    deadline: data.deadline,
    contentBrief: data.contentBrief,
    revisionRounds: data.revisionRounds,
    deliveryType: data.deliveryType,
    creatorRequirements: data.creatorRequirements,
  };

  if (data.deliveryType === CampaignDeliveryType.ONSITE && data.shootingLat && data.shootingLng) {
    payload.shootingLocation = {
      geo: {
        type: "Point",
        coordinates: [parseFloat(data.shootingLng), parseFloat(data.shootingLat)],
      },
      radiusKm: data.shootingRadiusKm ? parseInt(data.shootingRadiusKm) : undefined,
    };
  }

  return payload;
}

type ReviewRowProps = {
  icon: ReactElement;
  label: string;
  value: ReactElement | string;
};

function ReviewRow({ icon, label, value }: ReviewRowProps): ReactElement {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

export function StepReview(): ReactElement {
  const { data, prevStep } = useCampaignWizardStore();
  const { mutate: createDraft, isPending: isDraftPending } = useCreateCampaign();
  const { mutate: createAndPublish, isPending: isPublishPending } = useCreateAndPublishCampaign();

  const isPending = isDraftPending || isPublishPending;
  const payload = buildPayload(data);

  const platformIcon =
    data.platform === CampaignPlatform.INSTAGRAM ? (
      <FaInstagram className="size-3.5" />
    ) : data.platform === CampaignPlatform.YOUTUBE ? (
      <FaYoutube className="size-3.5" />
    ) : (
      <span className="text-[11px]">IG+YT</span>
    );

  const platformLabel =
    data.platform === CampaignPlatform.INSTAGRAM
      ? "Instagram"
      : data.platform === CampaignPlatform.YOUTUBE
        ? "YouTube"
        : "Instagram + YouTube";

  const genderLabel =
    data.targetGender === TargetGender.ANY
      ? "Any"
      : data.targetGender === TargetGender.FEMALE
        ? "Female"
        : "Male";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <div className="px-5 py-4 bg-gradient-ig/5 border-b border-border/50">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Campaign Summary
          </p>
          <h3 className="mt-1 text-lg font-bold text-foreground">{data.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.niche.map((n) => (
              <Badge key={n} variant="secondary" className="text-[10px]">
                {n}
              </Badge>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/50 px-5">
          <ReviewRow
            icon={platformIcon}
            label="Platform"
            value={platformLabel}
          />
          <ReviewRow
            icon={<MapPin className="size-3.5" />}
            label="Target Location"
            value={data.targetLocation}
          />
          <ReviewRow
            icon={<Users className="size-3.5" />}
            label="Audience"
            value={`${data.targetAgeMin}–${data.targetAgeMax} yrs · ${genderLabel}`}
          />
          <ReviewRow
            icon={<IndianRupee className="size-3.5" />}
            label="Budget"
            value={`₹${data.budgetAmount.toLocaleString("en-IN")}`}
          />
          <ReviewRow
            icon={<Calendar className="size-3.5" />}
            label="Deadline"
            value={new Date(data.deadline).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <ReviewRow
            icon={<MapPin className="size-3.5" />}
            label="Delivery"
            value={
              data.deliveryType === CampaignDeliveryType.ONSITE
                ? `Onsite — ${data.shootingLat}, ${data.shootingLng}${data.shootingRadiusKm ? ` (±${data.shootingRadiusKm} km)` : ""}`
                : "Remote"
            }
          />
          <ReviewRow
            icon={<RotateCcw className="size-3.5" />}
            label="Revision Rounds"
            value={`${data.revisionRounds} round${data.revisionRounds > 1 ? "s" : ""}`}
          />
        </div>
      </div>

      {/* Content brief preview */}
      <div className="rounded-xl border border-border/60 bg-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <FileText className="size-3.5 text-muted-foreground" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Content Brief
          </p>
        </div>
        <p className="text-sm text-foreground leading-relaxed line-clamp-4">{data.contentBrief}</p>
        <p className="text-[11px] text-muted-foreground">{data.contentBrief.length} characters</p>
      </div>

      <Separator />

      {/* CTA block */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          Save as a draft to edit later, or publish now so creators can start bidding.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* Save draft */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => createDraft(payload)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50",
            )}
          >
            {isDraftPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <BookmarkCheck className="size-4" />
            )}
            Save as Draft
          </button>

          {/* Publish now */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => createAndPublish(payload)}
            className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white bg-gradient-ig hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg"
          >
            {isPublishPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Rocket className="size-4" />
            )}
            Publish Now
          </button>
        </div>
      </div>

      {/* Back */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={prevStep}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
      </div>
    </div>
  );
}
