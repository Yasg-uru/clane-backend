import type { FilterQuery } from "mongoose";
import { CollabRoomModel, type CollabRoomDocument, type ICollabRoom } from "../../models/CollabRoom.model";
import type { PaginatedResult, WriteData } from "../../core/types";
import type { ICollabRoomRepository, CollabRoomFilters } from "../../core/interfaces/ICollabRoomRepository";
import { BaseRepository } from "./BaseRepository";

export type { CollabRoomFilters };

export class CollabRoomRepository
  extends BaseRepository<CollabRoomDocument, ICollabRoom>
  implements ICollabRoomRepository
{
  async findById(id: string): Promise<CollabRoomDocument | null> {
    return CollabRoomModel.findById(id).exec();
  }

  async create(data: WriteData<ICollabRoom>): Promise<CollabRoomDocument> {
    const [room] = await CollabRoomModel.create([data]);
    if (!room) throw new Error("Failed to create collab room");
    return room;
  }

  async updateById(
    id: string,
    data: WriteData<ICollabRoom>,
  ): Promise<CollabRoomDocument | null> {
    return CollabRoomModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await CollabRoomModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findByEscrowId(escrowId: string): Promise<CollabRoomDocument | null> {
    return CollabRoomModel.findOne({ escrowId }).exec();
  }

  async findByBidId(bidId: string): Promise<CollabRoomDocument | null> {
    return CollabRoomModel.findOne({ bidId }).exec();
  }

  async findByBrandId(
    brandId: string,
    filters: CollabRoomFilters,
  ): Promise<PaginatedResult<CollabRoomDocument>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const query: FilterQuery<CollabRoomDocument> = { brandId };
    if (filters.status) query.status = filters.status;

    const [total, items] = await Promise.all([
      CollabRoomModel.countDocuments(query),
      CollabRoomModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async findByCreatorId(
    creatorId: string,
    filters: CollabRoomFilters,
  ): Promise<PaginatedResult<CollabRoomDocument>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const query: FilterQuery<CollabRoomDocument> = { creatorId };
    if (filters.status) query.status = filters.status;

    const [total, items] = await Promise.all([
      CollabRoomModel.countDocuments(query),
      CollabRoomModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }
}
