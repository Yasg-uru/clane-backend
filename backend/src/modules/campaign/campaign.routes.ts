import { Router } from "express";
import type { CampaignController } from "./CampaignController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";

export const createCampaignRouter = (
  controller: CampaignController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  // Public — no auth required (register before auth routes to avoid matching /:campaignId)
  router.get("/public/:slug", controller.getPublicCampaignPreview);

  // Creator routes — register /browse before /:campaignId to prevent route collision
  router.get(
    "/browse",
    authMiddleware.authenticate,
    authMiddleware.requireRole("creator"),
    controller.browseCampaigns,
  );
  router.get(
    "/browse/:slug",
    authMiddleware.authenticate,
    authMiddleware.requireRole("creator"),
    controller.getCampaignDetailForCreator,
  );

  // Brand routes
  router.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.createDraft,
  );
  router.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.getBrandCampaigns,
  );
  router.get(
    "/:campaignId",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.getCampaignDetail,
  );
  router.patch(
    "/:campaignId",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.updateDraft,
  );
  router.post(
    "/:campaignId/publish",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.publishCampaign,
  );
  router.post(
    "/:campaignId/unpublish",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.unpublishCampaign,
  );
  router.post(
    "/:campaignId/close",
    authMiddleware.authenticate,
    authMiddleware.requireRole("brand"),
    controller.closeCampaign,
  );

  return router;
};
