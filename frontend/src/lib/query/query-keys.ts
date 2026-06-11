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
    browse: (filters?: Record<string, unknown>) =>
      [...queryKeys.creator.all, "browse", filters] as const,
  },
  campaign: {
    all: ["campaign"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.campaign.all, "list", filters] as const,
    detail: (id: string) => [...queryKeys.campaign.all, "detail", id] as const,
    browse: (filters?: Record<string, unknown>) =>
      [...queryKeys.campaign.all, "browse", filters] as const,
    browseDetail: (slug: string) =>
      [...queryKeys.campaign.all, "browse-detail", slug] as const,
  },
  bid: {
    all: ["bid"] as const,
    myBids: (filters?: Record<string, unknown>) =>
      [...queryKeys.bid.all, "my", filters] as const,
    forCampaign: (campaignId: string) =>
      [...queryKeys.bid.all, "campaign", campaignId] as const,
    myBidForCampaign: (campaignId: string) =>
      [...queryKeys.bid.all, "my-campaign", campaignId] as const,
  },
  escrow: {
    all: ["escrow"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.escrow.all, "list", filters] as const,
    detail: (escrowId: string) =>
      [...queryKeys.escrow.all, "detail", escrowId] as const,
  },
  collab: {
    all: ["collab"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.collab.all, "list", filters] as const,
    detail: (collabRoomId: string) =>
      [...queryKeys.collab.all, "detail", collabRoomId] as const,
  },
} as const;

export type QueryKeys = typeof queryKeys;
