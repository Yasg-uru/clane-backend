"use client";

import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError } from "@/components/auth/field-error";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import { step1Schema } from "@/schemas/campaign.schema";
import { CampaignPlatform } from "@/types/campaign.types";
import { PLATFORM_OPTIONS, NICHE_OPTIONS } from "@/config/campaign.config";
import { cn } from "@/lib/utils";

export function StepBasics(): ReactElement {
  const { data, updateData, nextStep } = useCampaignWizardStore();

  const form = useForm({
    defaultValues: {
      title: data.title,
      platform: data.platform,
      niche: data.niche,
      targetLocation: data.targetLocation,
    },
    validators: { onSubmit: step1Schema },
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
      {/* Campaign title */}
      <form.Field name="title">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Campaign Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="e.g. Summer Glow — Skincare Launch 2025"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              {field.state.value.length}/100 characters
            </p>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Platform */}
      <form.Field name="platform">
        {(field) => (
          <div className="space-y-2">
            <Label>
              Platform <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {PLATFORM_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.handleChange(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                    field.state.value === opt.value
                      ? "border-transparent bg-gradient-ig text-white shadow-lg"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/40",
                  )}
                >
                  <opt.Icon className={opt.iconClass} />
                  <span className="text-sm font-semibold">{opt.label}</span>
                  <span
                    className={cn(
                      "text-[11px]",
                      field.state.value === opt.value
                        ? "text-white/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Niche */}
      <form.Field name="niche">
        {(field) => {
          const toggle = (tag: string) => {
            const current = field.state.value;
            if (current.includes(tag)) {
              field.handleChange(current.filter((n) => n !== tag));
            } else if (current.length < 5) {
              field.handleChange([...current, tag]);
            }
          };
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>
                  Niche <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {field.state.value.length}/5 selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {NICHE_OPTIONS.map((tag) => {
                  const selected = field.state.value.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggle(tag)}
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-medium border transition-all",
                        selected
                          ? "bg-gradient-ig text-white border-transparent shadow-sm"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground",
                        !selected &&
                          field.state.value.length >= 5 &&
                          "opacity-40 cursor-not-allowed",
                      )}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              <FieldError errors={field.state.meta.errors} />
            </div>
          );
        }}
      </form.Field>

      {/* Target location */}
      <form.Field name="targetLocation">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Target Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id={field.name}
              placeholder="e.g. Mumbai, Delhi, All India"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground">
              Where should the creator&apos;s audience be based?
            </p>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

      {/* Footer */}
      <div className="flex justify-end pt-2">
        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold text-white bg-gradient-ig hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              Next: Audience
              <ArrowRight className="size-4" />
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
