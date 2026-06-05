"use client";

import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import { step2Schema } from "@/schemas/campaign.schema";
import { TargetGender, CampaignPlatform } from "@/types/campaign.types";
import { GENDER_OPTIONS } from "@/config/campaign.config";
import { cn } from "@/lib/utils";

export function StepAudience(): ReactElement {
  const { data, updateData, nextStep, prevStep } = useCampaignWizardStore();
  const isInstagram =
    data.platform === CampaignPlatform.INSTAGRAM || data.platform === CampaignPlatform.BOTH;
  const isYouTube =
    data.platform === CampaignPlatform.YOUTUBE || data.platform === CampaignPlatform.BOTH;

  const form = useForm({
    defaultValues: {
      targetAgeMin: data.targetAgeMin,
      targetAgeMax: data.targetAgeMax,
      targetGender: data.targetGender,
      creatorRequirements: data.creatorRequirements as {
        instagram?: {
          minFollowers?: number;
          maxFollowers?: number;
          minAvgReelViews?: number;
          minEngagementRate?: number;
          minPostsPerMonth?: number;
        };
        youtube?: {
          minSubscribers?: number;
          maxSubscribers?: number;
          minAvgVideoViews?: number;
          minVideosPerMonth?: number;
        };
        languages?: string[];
      },
    },
    validators: { onSubmit: step2Schema },
    onSubmit: ({ value }) => {
      updateData(value);
      nextStep();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Age range */}
      <div className="space-y-2">
        <Label>
          Audience Age Range <span className="text-destructive">*</span>
        </Label>
        <div className="flex items-center gap-3">
          <form.Field name="targetAgeMin">
            {(field) => (
              <div className="flex-1 space-y-1">
                <Input
                  type="number"
                  placeholder="Min (13)"
                  min={13}
                  max={65}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <span className="text-muted-foreground text-sm">to</span>
          <form.Field name="targetAgeMax">
            {(field) => (
              <div className="flex-1 space-y-1">
                <Input
                  type="number"
                  placeholder="Max (65)"
                  min={13}
                  max={65}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                />
                <FieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </div>
      </div>

      {/* Gender */}
      <form.Field name="targetGender">
        {(field) => (
          <div className="space-y-2">
            <Label>
              Target Gender <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-3">
              {GENDER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.handleChange(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all",
                    field.state.value === opt.value
                      ? "border-transparent bg-gradient-ig text-white"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Creator requirements — platform-specific */}
      {(isInstagram || isYouTube) && (
        <div className="space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Creator Requirements</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              All fields are optional — leave blank to accept any creator.
            </p>
          </div>

          {isInstagram && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Instagram
              </p>
              <div className="grid grid-cols-2 gap-3">
                <form.Field name="creatorRequirements.instagram.minFollowers">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Min Followers</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 10000"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="creatorRequirements.instagram.maxFollowers">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Max Followers</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 500000"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="creatorRequirements.instagram.minEngagementRate">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Min Engagement Rate (%)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 3.5"
                        min={0}
                        max={100}
                        step={0.1}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="creatorRequirements.instagram.minPostsPerMonth">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Min Posts/Month</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 8"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          )}

          {isYouTube && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                YouTube
              </p>
              <div className="grid grid-cols-2 gap-3">
                <form.Field name="creatorRequirements.youtube.minSubscribers">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Min Subscribers</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="creatorRequirements.youtube.minAvgVideoViews">
                  {(field) => (
                    <div className="space-y-1">
                      <Label className="text-xs">Min Avg Views</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 50000"
                        min={0}
                        value={field.state.value ?? ""}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={prevStep}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-gradient-ig hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Next: Budget
              <ArrowRight className="size-4" />
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
