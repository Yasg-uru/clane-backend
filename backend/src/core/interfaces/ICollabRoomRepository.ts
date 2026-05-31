import type { CollabRoomDocument, CollabRoomStatus, ICollabRoom } from "../../models/CollabRoom.model";
import type { PaginatedResult } from "../types";
import type { IRepository } from "./IRepository";

export interface CollabRoomFilters {
  status?: CollabRoomStatus;
  page?: number;
  limit?: number;
}

export interface ICollabRoomRepository extends IRepository<CollabRoomDocument, ICollabRoom> {
  findByEscrowId(escrowId: string): Promise<CollabRoomDocument | null>;
  findByBidId(bidId: string): Promise<CollabRoomDocument | null>;
  findByBrandId(brandId: string, filters: CollabRoomFilters): Promise<PaginatedResult<CollabRoomDocument>>;
  findByCreatorId(creatorId: string, filters: CollabRoomFilters): Promise<PaginatedResult<CollabRoomDocument>>;
}
