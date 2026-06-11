"use client";

import type { ReactElement } from "react";
import { GradientOrb } from "@/components/common/gradient-orb";
import { WizardProgress } from "./wizard-progress";
import { StepBasics } from "./steps/step-basics";
import { StepAudience } from "./steps/step-audience";
import { StepBudget } from "./steps/step-budget";
import { StepContent } from "./steps/step-content";
import { StepReview } from "./steps/step-review";
import { useCampaignWizardStore } from "@/stores/campaign-wizard.store";
import { STEP_META } from "@/config/campaign.config";

function renderStep(step: number): ReactElement {
  switch (step) {
    case 1: return <StepBasics />;
    case 2: return <StepAudience />;
    case 3: return <StepBudget />;
    case 4: return <StepContent />;
    case 5: return <StepReview />;
    default: return <StepBasics />;
  }
}

export function CampaignWizard(): ReactElement {
  const step = useCampaignWizardStore((s) => s.step);
  const meta = STEP_META[step - 1] ?? STEP_META[0];

  return (
    <div className="relative mx-auto max-w-2xl">
      {/* Ambient */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <GradientOrb
          color="from"
          className="-left-40 top-20 h-[500px] w-[500px] opacity-[0.05] blur-[140px] animate-pulse-glow"
        />
        <GradientOrb
          color="via"
          className="-right-20 bottom-0 h-[400px] w-[400px] opacity-[0.04] blur-[120px] animate-pulse-glow delay-neg-2s"
        />
      </div>

      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Create a <span className="text-gradient-ig">Campaign</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Step {step} of 5 — fill in the details and launch your campaign.
          </p>
        </div>

        {/* Progress */}
        <WizardProgress currentStep={step} />

        {/* Step card */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
          {/* Subtle gradient accent */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-[0.03]"
          />

          <div className="relative z-10 space-y-6">
            {/* Step header */}
            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-foreground">{meta.title}</h2>
              <p className="text-sm text-muted-foreground">{meta.desc}</p>
            </div>

            {/* Step content */}
            {renderStep(step)}
          </div>
        </div>
      </div>
    </div>
  );
}
