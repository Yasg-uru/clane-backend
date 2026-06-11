"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { CollabService } from "@/domain/collab/CollabService";
import { CollabRepository } from "@/domain/collab/CollabRepository";
import { useIsReady } from "@/hooks/common/useIsReady";

const collabService = new CollabService(new CollabRepository());

export function useMyCollabRooms() {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.collab.list(),
    queryFn: () => collabService.getMyCollabRooms(),
    enabled: ready,
    staleTime: 60_000,
  });
}

export function useCollabRoom(collabRoomId: string) {
  const ready = useIsReady();
  return useQuery({
    queryKey: queryKeys.collab.detail(collabRoomId),
    queryFn: () => collabService.getCollabRoom(collabRoomId),
    enabled: ready && Boolean(collabRoomId),
    staleTime: 60_000,
  });
}
