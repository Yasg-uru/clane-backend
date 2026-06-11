import type { CollabRoom, PaginatedCollabRooms } from "@/types/collab.types";

export interface ICollabRepository {
  getMyCollabRooms(): Promise<PaginatedCollabRooms>;
  getCollabRoom(collabRoomId: string): Promise<CollabRoom>;
}
