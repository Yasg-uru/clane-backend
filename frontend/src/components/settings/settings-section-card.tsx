import type { ReactElement, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsSectionCardProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  destructive?: boolean;
  className?: string;
};

export function SettingsSectionCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
  destructive = false,
  className,
}: SettingsSectionCardProps): ReactElement {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card",
        destructive ? "border-destructive/30" : "border-border/60",
        className,
      )}
    >
      <header
        className={cn(
          "flex items-start gap-3 border-b px-5 py-4 sm:px-6",
          destructive ? "border-destructive/20" : "border-border/50",
        )}
      >
        {Icon && (
          <span
            className={cn(
              "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
              destructive
                ? "bg-destructive/10 text-destructive"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon className="size-4.5" />
          </span>
        )}
        <div className="min-w-0">
          <h2
            className={cn(
              "text-base font-semibold leading-tight",
              destructive ? "text-destructive" : "text-foreground",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </header>

      <div className="px-5 py-5 sm:px-6">{children}</div>

      {footer && (
        <footer
          className={cn(
            "flex items-center justify-end gap-3 border-t px-5 py-3.5 sm:px-6",
            destructive ? "border-destructive/20 bg-destructive/[0.03]" : "border-border/50 bg-muted/30",
          )}
        >
          {footer}
        </footer>
      )}
    </section>
  );
}
