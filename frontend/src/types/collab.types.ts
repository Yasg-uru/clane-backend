export const CollabRoomStatus = {
  PENDING_CHAT: "pending_chat",
  ACTIVE: "active",
  CONTENT_SUBMITTED: "content_submitted",
  UNDER_REVIEW: "under_review",
  REVISION_REQUESTED: "revision_requested",
  APPROVED: "approved",
  COMPLETED: "completed",
  DISPUTED: "disputed",
} as const;
export type CollabRoomStatus = (typeof CollabRoomStatus)[keyof typeof CollabRoomStatus];

export interface CollabRoom {
  _id: string;
  escrowId: string;
  bidId: string;
  campaignId: string;
  brandId: string;
  creatorId: string;
  status: CollabRoomStatus;
  maxRevisions: number;
  revisionCount: number;
  collabDeadline: string;
  createdAt: string;
  updatedAt: string;
  campaignTitle?: string;
  campaignPlatform?: string;
  brandName?: string;
  creatorName?: string;
  creatorHandle?: string;
}

export interface PaginatedCollabRooms {
  items: CollabRoom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
