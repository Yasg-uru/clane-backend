"use client";

import type { ReactElement, ReactNode } from "react";

type EmptyStateProps = {
  icon: ReactElement;
  title: string;
  subtitle: string;
  action?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: EmptyStateProps): ReactElement {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 py-20 text-center">
      <div className="mb-3 text-muted-foreground/40">{icon}</div>
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground/70 max-w-xs">{subtitle}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
