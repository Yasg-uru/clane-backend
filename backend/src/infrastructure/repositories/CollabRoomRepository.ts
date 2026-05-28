import type { FilterQuery } from "mongoose";
import { CollabRoomModel, type CollabRoomDocument, type CollabRoomStatus } from "../../models/CollabRoom.model";
import type { PaginatedResult } from "../../core/types";
import { BaseRepository } from "./BaseRepository";

export interface CollabRoomFilters {
  status?: CollabRoomStatus;
  page?: number;
  limit?: number;
}

export class CollabRoomRepository extends BaseRepository<CollabRoomDocument> {
  async findById(id: string): Promise<CollabRoomDocument | null> {
    return CollabRoomModel.findById(id).exec();
  }

  async findByEmail(_email: string): Promise<CollabRoomDocument | null> {
    return null;
  }

  async findByEmailWithSecrets(_email: string): Promise<CollabRoomDocument | null> {
    return null;
  }

  async findByIdWithRefreshToken(_id: string): Promise<CollabRoomDocument | null> {
    return null;
  }

  async emailExists(_email: string): Promise<boolean> {
    return false;
  }

  async create(data: Partial<Record<string, unknown>>): Promise<CollabRoomDocument> {
    const [room] = await CollabRoomModel.create([data]);
    if (!room) throw new Error("Failed to create collab room");
    return room;
  }

  async updateById(
    id: string,
    data: Partial<Record<string, unknown>>,
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
    const query: FilterQuery<CollabRoomDocument> = { brandId };
    if (filters.status) query.status = filters.status;
    return this.runPaginated(query, filters.page ?? 1, filters.limit ?? 20);
  }

  async findByCreatorId(
    creatorId: string,
    filters: CollabRoomFilters,
  ): Promise<PaginatedResult<CollabRoomDocument>> {
    const query: FilterQuery<CollabRoomDocument> = { creatorId };
    if (filters.status) query.status = filters.status;
    return this.runPaginated(query, filters.page ?? 1, filters.limit ?? 20);
  }

  private async runPaginated(
    query: FilterQuery<CollabRoomDocument>,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CollabRoomDocument>> {
    const [total, items] = await Promise.all([
      CollabRoomModel.countDocuments(query),
      CollabRoomModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
