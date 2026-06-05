import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SettingsRowProps = {
  label: string;
  description?: string;
  control: ReactNode;
  /** Stacks the control beneath the label on all breakpoints when true. */
  stacked?: boolean;
  className?: string;
};

/**
 * A labelled row with a right-aligned control — the building block for toggle,
 * connection and preference lists.
 */
export function SettingsRow({
  label,
  description,
  control,
  stacked = false,
  className,
}: SettingsRowProps): ReactElement {
  return (
    <div
      className={cn(
        "flex gap-4 py-3.5",
        stacked ? "flex-col" : "flex-row items-center justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn("shrink-0", stacked && "self-start")}>{control}</div>
    </div>
  );
}
