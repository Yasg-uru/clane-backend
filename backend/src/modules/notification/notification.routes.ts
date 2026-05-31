import { Router } from "express";
import type { NotificationController } from "./NotificationController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";

export const createNotificationRouter = (
  controller: NotificationController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  router.get("/", authMiddleware.authenticate, controller.getNotifications);
  router.get("/unread-count", authMiddleware.authenticate, controller.getUnreadCount);
  router.patch("/:notificationId/read", authMiddleware.authenticate, controller.markAsRead);
  router.patch("/read-all", authMiddleware.authenticate, controller.markAllAsRead);

  return router;
};
