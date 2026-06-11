import { z } from "zod";
import { CollabRoomStatus } from "../../models/CollabRoom.model";
import { COLLAB_LIST_LIMIT_DEFAULT, COLLAB_LIST_LIMIT_MAX } from "./collab.constants";

export const collabListQuerySchema = z.object({
  status: z.nativeEnum(CollabRoomStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(COLLAB_LIST_LIMIT_MAX).default(COLLAB_LIST_LIMIT_DEFAULT),
});

export type CollabListQuery = z.infer<typeof collabListQuerySchema>;
