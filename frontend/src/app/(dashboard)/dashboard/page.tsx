"use client";

import type { ReactElement } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandDashboard } from "@/components/dashboard/brand-dashboard";
import { CreatorDashboard } from "@/components/dashboard/creator-dashboard";
import { useCurrentBrand, useCurrentCreator } from "@/hooks/auth/useCurrentUser";

export default function DashboardPage(): ReactElement {
  const brand = useCurrentBrand();
  const creator = useCurrentCreator();

  if (brand) {
    return <BrandDashboard brand={brand} />;
  }

  if (creator) {
    return <CreatorDashboard creator={creator} />;
  }

  return <DashboardSkeleton />;
}

function DashboardSkeleton(): ReactElement {
  return (
    <div className="space-y-8">
      {/* Welcome banner skeleton */}
      <Skeleton className="h-44 w-full rounded-3xl" />

      {/* Stats row skeleton */}
      <div>
        <Skeleton className="mb-4 h-4 w-24" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* CTA skeleton */}
      <Skeleton className="h-48 w-full rounded-2xl" />

      {/* Cards skeleton */}
      <div>
        <Skeleton className="mb-5 h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
