import type { CollabRoomStatus } from "../../models/CollabRoom.model";

export interface CollabRoomView {
  _id: string;
  escrowId: string;
  bidId: string;
  campaignId: string;
  brandId: string;
  creatorId: string;
  status: CollabRoomStatus;
  maxRevisions: number;
  revisionCount: number;
  collabDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}
