import { Router } from "express";
import type { AuthController } from "./AuthController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";

export const createAuthRouter = (
  controller: AuthController,
  authMiddleware: AuthMiddleware,
): Router => {
  const router = Router();

  router.post("/brand/register", controller.registerBrand);
  router.post("/creator/register", controller.registerCreator);
  router.post("/verify-otp", controller.verifyOtp);
  router.post("/login", controller.login);
  router.post("/refresh", controller.refresh);
  router.post("/logout", authMiddleware.authenticate, controller.logout);
  router.post("/resend-otp", controller.resendOtp);

  return router;
};
