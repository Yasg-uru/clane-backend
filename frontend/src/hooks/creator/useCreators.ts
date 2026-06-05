"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { CreatorService } from "@/domain/creator/CreatorService";
import { CreatorRepository } from "@/domain/creator/CreatorRepository";
import { useIsReady } from "@/hooks/common/useIsReady";
import type { CreatorListFilters, PaginatedCreators } from "@/types/creator.types";

const creatorService = new CreatorService(new CreatorRepository());

export function useCreators(filters: CreatorListFilters = {}): ReturnType<
  typeof useQuery<PaginatedCreators>
> {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.creator.browse(filters as Record<string, unknown>),
    queryFn: () => creatorService.browseCreators(filters),
    enabled: ready,
    staleTime: 300_000,
  });
}
