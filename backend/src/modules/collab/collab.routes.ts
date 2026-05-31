import { Router } from "express";
import type { CollabController } from "./CollabController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";

export const createCollabRouter = (
  controller: CollabController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  router.get("/", authMiddleware.authenticate, controller.getMyCollabRooms);
  router.get("/:collabRoomId", authMiddleware.authenticate, controller.getCollabRoom);

  return router;
};
