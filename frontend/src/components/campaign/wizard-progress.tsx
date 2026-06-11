import type { ReactElement } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type WizardStep = {
  number: number;
  label: string;
};

const STEPS: WizardStep[] = [
  { number: 1, label: "Basics" },
  { number: 2, label: "Audience" },
  { number: 3, label: "Budget" },
  { number: 4, label: "Content" },
  { number: 5, label: "Review" },
];

type WizardProgressProps = {
  currentStep: number;
};

export function WizardProgress({ currentStep }: WizardProgressProps): ReactElement {
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, idx) => {
        const isDone = step.number < currentStep;
        const isActive = step.number === currentStep;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.number} className={cn("flex items-center", !isLast && "flex-1")}>
            {/* Circle */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-bold border-2 transition-all",
                  isDone && "bg-gradient-ig border-transparent text-white",
                  isActive &&
                    "border-transparent bg-gradient-ig text-white ring-4 ring-[color:var(--grad-from)]/20",
                  !isDone && !isActive && "border-border bg-muted text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-3.5" /> : step.number}
              </div>
              <span
                className={cn(
                  "hidden sm:block text-[11px] font-medium whitespace-nowrap",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 rounded-full transition-all",
                  isDone ? "bg-gradient-ig" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
