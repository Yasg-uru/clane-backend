import { Router } from "express";
import { UserRole } from "../../core/types";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";
import type { CreatorController } from "./CreatorController";

export const createCreatorRouter = (
  controller: CreatorController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  router.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.browseCreators,
  );

  return router;
};
