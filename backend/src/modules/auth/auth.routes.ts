import { Router } from "express";
import type { AuthController } from "./AuthController";
import type { AuthMiddleware } from "../../infrastructure/middleware/AuthMiddleware";
import type { SocialAuthMiddleware } from "../../infrastructure/middleware/SocialAuthMiddleware";

export const createAuthRouter = (
  controller: AuthController,
  authMiddleware: AuthMiddleware,
  socialAuthMiddleware: SocialAuthMiddleware,
): Router => {
  const router = Router();

  router.post("/brand/register", controller.registerBrand);
  router.post("/creator/register", controller.registerCreator);
  router.post("/verify-otp", controller.verifyOtp);
  router.post("/login", controller.login);
  router.post("/refresh", controller.refresh);
  router.post("/logout", authMiddleware.authenticate, controller.logout);
  router.post("/resend-otp", controller.resendOtp);

  // Social auth — initiate OAuth login
  router.get(
    "/:role/:provider",
    socialAuthMiddleware.validateSocialParams,
    controller.initiateSocialAuth,
  );

  // Social auth — OAuth callback (handles both login and connect intents via state)
  router.get(
    "/:role/:provider/callback",
    socialAuthMiddleware.validateSocialParams,
    controller.handleSocialCallback,
  );

  // Social auth — initiate OAuth connect for an already-authenticated user
  router.post(
    "/:role/:provider/connect",
    socialAuthMiddleware.validateSocialParams,
    authMiddleware.authenticate,
    controller.connectSocialAccount,
  );

  // Social auth — complete profile after OAuth signup
  router.patch(
    "/:role/complete-profile",
    socialAuthMiddleware.validateSocialParams,
    authMiddleware.authenticateOrIntermediate,
    controller.completeSocialProfile,
  );

  // Social auth — submit email for Instagram users who didn't share one
  router.post(
    "/:role/instagram/submit-email",
    socialAuthMiddleware.validateSocialParams,
    socialAuthMiddleware.oauthSessionAuth,
    controller.submitInstagramEmail,
  );

  return router;
};
