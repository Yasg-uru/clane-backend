"use client";

import type { ReactElement } from "react";
import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/auth/field-error";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import { step4Schema } from "@/schemas/campaign.schema";
import { cn } from "@/lib/utils";

const REVISION_OPTIONS = [
  { value: 1 as const, label: "1 round", desc: "One revision included" },
  { value: 2 as const, label: "2 rounds", desc: "Two revisions included" },
] as const;

const BRIEF_PROMPTS = [
  "What is the campaign about?",
  "What tone / mood should the content have?",
  "What are the key messages to highlight?",
  "Any specific hashtags or mentions required?",
  "What's the call-to-action?",
];

export function StepContent(): ReactElement {
  const { data, updateData, nextStep, prevStep } = useCampaignWizardStore();

  const form = useForm({
    defaultValues: {
      contentBrief: data.contentBrief,
      revisionRounds: data.revisionRounds,
    },
    validators: { onSubmit: step4Schema },
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
      {/* Content brief */}
      <form.Field name="contentBrief">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>
              Content Brief <span className="text-destructive">*</span>
            </Label>

            {/* Prompts */}
            <div className="rounded-xl bg-muted/30 border border-border/50 p-3 space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Suggest covering:
              </p>
              {BRIEF_PROMPTS.map((prompt) => (
                <p key={prompt} className="text-[12px] text-muted-foreground flex gap-2">
                  <span className="text-gradient-ig font-bold">·</span>
                  {prompt}
                </p>
              ))}
            </div>

            <Textarea
              id={field.name}
              placeholder="Describe what you want the creator to produce. Include tone, key messages, required mentions, hashtags, call-to-action, and any dos and don'ts..."
              rows={8}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="resize-none"
            />
            <div className="flex justify-between">
              <FieldError errors={field.state.meta.errors} />
              <span
                className={cn(
                  "text-[11px] ml-auto",
                  field.state.value.length < 50
                    ? "text-destructive"
                    : field.state.value.length > 1800
                      ? "text-amber-500"
                      : "text-muted-foreground",
                )}
              >
                {field.state.value.length}/2000
              </span>
            </div>
          </div>
        )}
      </form.Field>

      {/* Revision rounds */}
      <form.Field name="revisionRounds">
        {(field) => (
          <div className="space-y-2">
            <Label>
              Revision Rounds <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {REVISION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => field.handleChange(opt.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    field.state.value === opt.value
                      ? "border-transparent bg-gradient-ig text-white"
                      : "border-border bg-card hover:bg-muted/40",
                  )}
                >
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p
                    className={cn(
                      "text-[11px] mt-0.5",
                      field.state.value === opt.value ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
            <FieldError errors={field.state.meta.errors} />
          </div>
        )}
      </form.Field>

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
              Review Campaign
              <ArrowRight className="size-4" />
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
