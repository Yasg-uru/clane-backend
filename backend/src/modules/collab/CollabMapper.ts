import type { CollabRoomDocument } from "../../models/CollabRoom.model";
import type { CollabRoomView } from "./collab.types";

export class CollabMapper {
  static toView(room: CollabRoomDocument): CollabRoomView {
    return {
      _id: room._id.toString(),
      escrowId: room.escrowId.toString(),
      bidId: room.bidId.toString(),
      campaignId: room.campaignId.toString(),
      brandId: room.brandId.toString(),
      creatorId: room.creatorId.toString(),
      status: room.status,
      maxRevisions: room.maxRevisions,
      revisionCount: room.revisionCount,
      collabDeadline: room.collabDeadline,
      createdAt: room.createdAt ?? new Date(),
      updatedAt: room.updatedAt ?? new Date(),
    };
  }
}
