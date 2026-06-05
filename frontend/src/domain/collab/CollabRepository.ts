import { apiClient } from "@/lib/api/client";
import { COLLAB_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types";
import type { CollabRoom, PaginatedCollabRooms } from "@/types/collab.types";
import type { ICollabRepository } from "./ICollabRepository";

export class CollabRepository implements ICollabRepository {
  async getMyCollabRooms(): Promise<PaginatedCollabRooms> {
    const response = await apiClient.get<ApiResponse<PaginatedCollabRooms>>(
      COLLAB_ENDPOINTS.list,
    );
    return response.data.data;
  }

  async getCollabRoom(collabRoomId: string): Promise<CollabRoom> {
    const response = await apiClient.get<ApiResponse<{ collabRoom: CollabRoom }>>(
      COLLAB_ENDPOINTS.detail(collabRoomId),
    );
    return response.data.data.collabRoom;
  }
}
