"use client";

import type { ReactElement } from "react";
import { Star } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type CreatorPreviewCardProps = {
  name: string;
  handle: string;
  niche: readonly string[];
  followers: string;
  platform: "Instagram" | "YouTube";
  score: number;
  initials: string;
};

export function CreatorPreviewCard({
  name,
  handle,
  niche,
  followers,
  platform,
  score,
  initials,
}: CreatorPreviewCardProps): ReactElement {
  const isInstagram = platform === "Instagram";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-md hover:border-border">
      <div className="flex items-center gap-3">
        <div className="ring-gradient-ig rounded-full p-[2px] shrink-0">
          <Avatar className="size-10">
            <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{handle}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold text-foreground leading-none">{followers}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">followers</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5">
          {isInstagram ? (
            <FaInstagram className="size-3.5 text-muted-foreground" />
          ) : (
            <FaYoutube className="size-3.5 text-muted-foreground" />
          )}
          <span className="text-[11px] font-medium text-muted-foreground">{platform}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {niche.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-2">
        <Star className="size-3.5 text-amber-500 fill-amber-500 shrink-0" />
        <span className="text-xs font-semibold text-foreground">{score}</span>
        <span className="text-[11px] text-muted-foreground">/ 100 authenticity</span>
      </div>
    </div>
  );
}
