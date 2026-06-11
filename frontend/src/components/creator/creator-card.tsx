"use client";

import type { ReactElement } from "react";
import { Star, MapPin } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreatorBrowseItem } from "@/types/creator.types";
import { CreatorPlatform } from "@/types/creator.types";
import { formatFollowers } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type CreatorCardProps = {
  creator: CreatorBrowseItem;
};

export function CreatorCard({ creator }: CreatorCardProps): ReactElement {
  const initials = creator.fullName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  const score = creator.instagramAuthenticityScore ?? creator.youtubeAuthenticityScore;
  const scoreColor =
    score !== undefined && score >= 90
      ? "text-emerald-500"
      : score !== undefined && score >= 80
      ? "text-amber-500"
      : "text-muted-foreground";

  const engagementRate = creator.instagramEngagementRate ?? creator.youtubeEngagementRate;
  const avgViews = creator.instagramAvgLikes ?? creator.youtubeAvgViews;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 transition-all hover:shadow-lg hover:border-border/90 hover:-translate-y-0.5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-ig opacity-0 group-hover:opacity-[0.03] transition-opacity"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="ring-gradient-ig rounded-full p-[2px] shrink-0">
            <Avatar className="size-11">
              {creator.instagramProfilePicUrl && (
                <AvatarImage src={creator.instagramProfilePicUrl} alt={creator.fullName} />
              )}
              <AvatarFallback className="text-xs font-bold bg-muted">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{creator.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{creator.instagramHandle}</p>
            <div className="mt-0.5 flex items-center gap-1">
              <MapPin className="size-2.5 text-muted-foreground/60 shrink-0" />
              <span className="text-[10px] text-muted-foreground/60">{creator.city}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 rounded-lg bg-muted/80 px-2 py-1">
          {creator.platform === CreatorPlatform.BOTH ? (
            <span className="flex gap-0.5">
              <FaInstagram className="size-3 text-muted-foreground" />
              <FaYoutube className="size-3 text-muted-foreground" />
            </span>
          ) : creator.platform === CreatorPlatform.YOUTUBE ? (
            <FaYoutube className="size-3 text-muted-foreground" />
          ) : (
            <FaInstagram className="size-3 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-base font-bold text-foreground leading-none">
            {formatFollowers(creator.instagramFollowers)}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">followers</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-base font-bold text-foreground leading-none">
            {engagementRate?.toFixed(1) ?? "—"}%
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">engagement</p>
        </div>
        <div className="rounded-xl bg-muted/50 px-2.5 py-2 text-center">
          <p className="text-base font-bold text-foreground leading-none">
            {avgViews ? formatFollowers(avgViews) : "—"}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">avg views</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {creator.niche.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
            {tag}
          </Badge>
        ))}
      </div>

      {score !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-muted/40 px-3 py-2">
          <Star className={cn("size-3.5 fill-current shrink-0", scoreColor)} />
          <span className={cn("text-xs font-bold", scoreColor)}>{score}</span>
          <span className="text-[11px] text-muted-foreground">/ 100 authenticity</span>
        </div>
      )}
    </div>
  );
}

export function CreatorCardSkeleton(): ReactElement {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
      </div>
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 rounded-xl" />
    </div>
  );
}
