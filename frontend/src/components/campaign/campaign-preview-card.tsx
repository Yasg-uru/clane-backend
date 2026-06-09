"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes.config";
import { cn } from "@/lib/utils";

type CampaignPreviewCardProps = {
  brand: string;
  title: string;
  niche: readonly string[];
  budget: string;
  deadline: string;
  platform: "Instagram" | "YouTube";
  bids: number;
};

export function CampaignPreviewCard({
  brand,
  title,
  niche,
  budget,
  deadline,
  platform,
  bids,
}: CampaignPreviewCardProps): ReactElement {
  const isInstagram = platform === "Instagram";

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-300 hover:-translate-y-0.5",
        isInstagram
          ? "border-border/50 hover:border-pink-500/25 hover:shadow-lg hover:shadow-pink-950/20"
          : "border-border/50 hover:border-red-500/25 hover:shadow-lg hover:shadow-red-950/20",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          isInstagram
            ? "bg-gradient-to-b from-pink-500 via-purple-500 to-orange-400"
            : "bg-gradient-to-b from-red-600 to-red-400",
        )}
      />

      <div className="flex flex-col gap-3 p-5 pl-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 truncate">
            {brand}
          </p>
          <div
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border",
              isInstagram
                ? "bg-pink-500/8 text-pink-400 border-pink-500/20"
                : "bg-red-500/8 text-red-400 border-red-500/20",
            )}
          >
            {isInstagram ? <FaInstagram className="size-2.5" /> : <FaYoutube className="size-2.5" />}
            {platform}
          </div>
        </div>

        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 flex-1">
          {title}
        </h3>

        <div className="flex flex-wrap gap-1">
          {niche.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 bg-muted/50 font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <Separator className="opacity-40" />

        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground/50 mb-0.5">Budget</p>
            <p className="text-xl font-bold text-foreground tracking-tight leading-none">{budget}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground/60">
              <Clock className="size-2.5" />
              {deadline}
            </div>
            <p className="text-[10px] text-muted-foreground/40 mt-0.5">{bids} bids</p>
          </div>
        </div>

        <Link
          href={ROUTES.creator.discover}
          className={cn(
            buttonVariants({ size: "sm" }),
            "w-full h-8 gap-1.5 bg-gradient-ig text-white border-transparent hover:opacity-90 text-xs font-semibold shadow-sm",
          )}
        >
          Bid Now
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
