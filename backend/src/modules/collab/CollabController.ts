import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { requireParam, requireUser } from "../../utils/httpContext";
import type { CollabService } from "./CollabService";
import { collabListQuerySchema } from "./collab.validator";

export class CollabController {
  constructor(private readonly collabService: CollabService) {}

  getMyCollabRooms = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const filters = collabListQuerySchema.parse(req.query);
    const result = await this.collabService.getCollabRoomsForUser(user.userId, user.role, filters);
    res.status(200).json(
      new ApiResponse("Collab rooms retrieved", {
        items: result.items,
        pagination: result.pagination,
      }),
    );
  });

  getCollabRoom = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const collabRoomId = requireParam(req, "collabRoomId");
    const collabRoom = await this.collabService.getCollabRoom(user.userId, user.role, collabRoomId);
    res.status(200).json(new ApiResponse("Collab room retrieved", { collabRoom }));
  });
}
