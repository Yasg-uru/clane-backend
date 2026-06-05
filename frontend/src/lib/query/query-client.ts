import { QueryClient } from "@tanstack/react-query";
import { normalizeError, ApiError } from "@/lib/api/error-handler";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 2 minutes — no refetch during that window,
        // even on component remount (which happens on every back-navigation when
        // the Router Cache misses). Keeps navigation snappy.
        staleTime: 1000 * 60 * 2,

        // Keep unused data in cache for 30 minutes. If the user navigates away
        // and comes back within this window, TanStack Query returns the cached
        // data instantly (isLoading: false) while optionally refetching in the
        // background.
        gcTime: 1000 * 60 * 30,

        // On mount, only refetch if data is stale (past staleTime).
        // When data is fresh, the component shows it instantly — no flash.
        refetchOnMount: true,

        // Reconnect fetches are useful on mobile; keep them on.
        refetchOnReconnect: true,

        // Don't refetch when the tab re-gains focus — avoids distracting
        // background activity when the user switches apps briefly.
        refetchOnWindowFocus: false,

        retry: (failureCount, error) => {
          const apiError = normalizeError(error);
          // Never retry auth errors — they need the user to act, not the client.
          if (
            apiError instanceof ApiError &&
            (apiError.isUnauthorized || apiError.isForbidden)
          ) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
