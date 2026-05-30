import { QueryClient } from "@tanstack/react-query";
import { normalizeError, ApiError } from "@/lib/api/error-handler";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error) => {
          const apiError = normalizeError(error);
          if (apiError instanceof ApiError && (apiError.isUnauthorized || apiError.isForbidden)) {
            return false;
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
