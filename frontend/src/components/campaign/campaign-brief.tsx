"use client";

import type { ReactElement } from "react";
import { FileText } from "lucide-react";

type CampaignBriefProps = {
  contentBrief: string;
};

export function CampaignBrief({ contentBrief }: CampaignBriefProps): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-ig text-white">
          <FileText className="size-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Campaign Brief</h2>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {contentBrief}
      </p>
    </div>
  );
}
