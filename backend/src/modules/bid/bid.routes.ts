import { Router } from "express";
import type { BidController } from "./BidController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";
import { UserRole } from "../../core/types";

export const createBidRouter = (
  controller: BidController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  // ─── Creator routes ────────────────────────────────────────────────────────
  router.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Creator),
    controller.submitBid,
  );

  router.get(
    "/my",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Creator),
    controller.getCreatorBids,
  );

  router.get(
    "/my/campaign/:campaignId",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Creator),
    controller.getCreatorBidForCampaign,
  );

  router.delete(
    "/:bidId/withdraw",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Creator),
    controller.withdrawBid,
  );

  // ─── Brand routes ──────────────────────────────────────────────────────────
  router.get(
    "/campaign/:campaignId",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.getBidsForCampaign,
  );

  router.post(
    "/:bidId/shortlist",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.shortlistBid,
  );

  router.delete(
    "/:bidId/shortlist",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.unshortlistBid,
  );

  router.post(
    "/:bidId/decline",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.declineBid,
  );

  router.post(
    "/:bidId/accept",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.acceptBid,
  );

  return router;
};

export const createNotificationRouter = (
  controller: BidController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  router.get("/", authMiddleware.authenticate, controller.getNotifications);
  router.get("/unread-count", authMiddleware.authenticate, controller.getUnreadCount);
  router.patch("/:notificationId/read", authMiddleware.authenticate, controller.markAsRead);
  router.patch("/read-all", authMiddleware.authenticate, controller.markAllAsRead);

  return router;
};
