import { normalizeError } from "@/lib/api/error-handler";
import type { CollabRoom, PaginatedCollabRooms } from "@/types/collab.types";
import type { ICollabRepository } from "./ICollabRepository";

export class CollabService {
  constructor(private readonly repo: ICollabRepository) {}

  async getMyCollabRooms(): Promise<PaginatedCollabRooms> {
    try {
      return await this.repo.getMyCollabRooms();
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getCollabRoom(collabRoomId: string): Promise<CollabRoom> {
    try {
      return await this.repo.getCollabRoom(collabRoomId);
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
