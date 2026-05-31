import type { PaginatedResult, UserRole } from "../../core/types";
import { UserRole as Role } from "../../core/types";
import type { ICollabRoomRepository } from "../../core/interfaces/ICollabRoomRepository";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { CollabMapper } from "./CollabMapper";
import type { CollabRoomView } from "./collab.types";
import type { CollabListQuery } from "./collab.validator";

export class CollabService {
  constructor(private readonly collabRoomRepository: ICollabRoomRepository) {}

  async getCollabRoomsForUser(
    userId: string,
    role: UserRole,
    filters: CollabListQuery,
  ): Promise<PaginatedResult<CollabRoomView>> {
    const result =
      role === Role.Brand
        ? await this.collabRoomRepository.findByBrandId(userId, filters)
        : await this.collabRoomRepository.findByCreatorId(userId, filters);

    return {
      items: result.items.map((room) => CollabMapper.toView(room)),
      pagination: result.pagination,
    };
  }

  async getCollabRoom(
    userId: string,
    role: UserRole,
    collabRoomId: string,
  ): Promise<CollabRoomView> {
    const room = await this.collabRoomRepository.findById(collabRoomId);
    if (!room) throw new NotFoundError("Collab room not found", "COLLAB_ROOM_NOT_FOUND");

    const ownerId = role === Role.Brand ? room.brandId.toString() : room.creatorId.toString();
    if (ownerId !== userId) {
      // Don't leak existence to non-owners.
      throw new NotFoundError("Collab room not found", "COLLAB_ROOM_NOT_FOUND");
    }

    return CollabMapper.toView(room);
  }
}
