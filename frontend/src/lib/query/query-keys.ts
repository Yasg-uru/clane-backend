export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },
  brand: {
    all: ["brand"] as const,
    profile: (id: string) => [...queryKeys.brand.all, "profile", id] as const,
  },
  creator: {
    all: ["creator"] as const,
    profile: (id: string) => [...queryKeys.creator.all, "profile", id] as const,
    search: (params: Record<string, unknown>) =>
      [...queryKeys.creator.all, "search", params] as const,
  },
  campaign: {
    all: ["campaign"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.campaign.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.campaign.all, "detail", id] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
