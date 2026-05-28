import { AuthError } from "../../core/errors/AuthError";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import type { CollabRoomRepository } from "../../infrastructure/repositories/CollabRoomRepository";
import type { CollabRoomDocument } from "../../models/CollabRoom.model";
import { UserRole } from "../../core/types";
import { collabListQuerySchema } from "../escrow/escrow.validator";
import type { CollabRoomView } from "../escrow/escrow.types";
import { toParam } from "../../utils/requestParam";

export class CollabController {
  constructor(private readonly collabRoomRepository: CollabRoomRepository) {}

  getMyCollabRooms = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const filters = collabListQuerySchema.parse(req.query);
    const result =
      req.user.role === UserRole.Brand
        ? await this.collabRoomRepository.findByBrandId(req.user.userId, filters)
        : await this.collabRoomRepository.findByCreatorId(req.user.userId, filters);

    res.status(200).json(
      new ApiResponse("Collab rooms retrieved", {
        items: result.items.map((r) => this.toView(r)),
        pagination: result.pagination,
      }),
    );
  });

  getCollabRoom = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const collabRoomId = toParam(req.params["collabRoomId"]);
    if (!collabRoomId) throw new AuthError("Unauthorized");

    const room = await this.collabRoomRepository.findById(collabRoomId);
    if (!room) throw new NotFoundError("Collab room not found", "COLLAB_ROOM_NOT_FOUND");

    const ownerId =
      req.user.role === UserRole.Brand ? room.brandId.toString() : room.creatorId.toString();
    if (ownerId !== req.user.userId) {
      throw new NotFoundError("Collab room not found", "COLLAB_ROOM_NOT_FOUND");
    }

    res.status(200).json(new ApiResponse("Collab room retrieved", { collabRoom: this.toView(room) }));
  });

  private toView(room: CollabRoomDocument): CollabRoomView {
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
