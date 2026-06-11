import express, { Router } from "express";
import type { EscrowController } from "./EscrowController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";
import { UserRole } from "../../core/types";

export const createEscrowRouter = (
  controller: EscrowController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  // Brand-only writes
  router.post(
    "/:escrowId/cancel",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.cancelEscrow,
  );

  router.post(
    "/:escrowId/refresh-link",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.refreshPaymentLink,
  );

  router.post(
    "/:escrowId/verify-payment",
    authMiddleware.authenticate,
    authMiddleware.requireRole(UserRole.Brand),
    controller.verifyPayment,
  );

  // List — delegates to brand or creator handler based on role
  router.get(
    "/",
    authMiddleware.authenticate,
    controller.listEscrows,
  );

  // Detail — delegates to brand or creator view based on role
  router.get(
    "/:escrowId",
    authMiddleware.authenticate,
    controller.getEscrow,
  );

  return router;
};

export const createWebhookRouter = (controller: EscrowController): Router => {
  const router = Router();

  router.post(
    "/razorpay",
    express.raw({ type: "application/json" }),
    controller.handleRazorpayWebhook,
  );

  return router;
};
