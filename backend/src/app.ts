import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { ApiResponse } from "./core/responses/ApiResponse";
import { swaggerSpec } from "./docs/swagger";
import type { AuthController } from "./modules/auth/AuthController";
import type { CampaignController } from "./modules/campaign/CampaignController";
import type { BidController } from "./modules/bid/BidController";
import type { EscrowController } from "./modules/escrow/EscrowController";
import type { CollabController } from "./modules/collab/CollabController";
import type { AuthMiddleware } from "./infrastructure/middleware/AuthMiddleware";
import type { RateLimiterMiddleware } from "./infrastructure/middleware/RateLimiterMiddleware";
import type { ErrorHandlerMiddleware } from "./infrastructure/middleware/ErrorHandlerMiddleware";
import type { NotFoundMiddleware } from "./infrastructure/middleware/NotFoundMiddleware";
import type { RequestLoggerMiddleware } from "./infrastructure/middleware/RequestLoggerMiddleware";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { createCampaignRouter } from "./modules/campaign/campaign.routes";
import { createBidRouter, createNotificationRouter } from "./modules/bid/bid.routes";
import { createEscrowRouter, createWebhookRouter } from "./modules/escrow/escrow.routes";
import { createCollabRouter } from "./modules/collab/collab.routes";

export class App {
  private readonly express: Application;

  constructor(
    private readonly authController: AuthController,
    private readonly campaignController: CampaignController,
    private readonly bidController: BidController,
    private readonly escrowController: EscrowController,
    private readonly collabController: CollabController,
    private readonly authMiddleware: AuthMiddleware,
    private readonly rateLimiter: RateLimiterMiddleware,
    private readonly errorHandler: ErrorHandlerMiddleware,
    private readonly notFound: NotFoundMiddleware,
    private readonly requestLogger: RequestLoggerMiddleware,
  ) {
    this.express = express();
    this.initialiseMiddleware();
    this.initialiseRoutes();
    this.initialiseErrorHandling();
  }

  getExpressApp(): Application {
    return this.express;
  }

  private initialiseMiddleware(): void {
    this.express.set("trust proxy", 1);
    // Allow inline scripts/styles on /api/docs only — swagger-ui-express requires them.
    // All other helmet protections remain fully active.
    this.express.use((req, res, next) => {
      if (req.path.startsWith("/api/docs")) {
        return helmet({ contentSecurityPolicy: false })(req, res, next);
      }
      return helmet()(req, res, next);
    });
    this.express.use(
      cors({
        origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
        credentials: true,
      }),
    );
    this.express.use(this.requestLogger.handle);

    // Razorpay webhook needs the raw body string for HMAC verification.
    // Mount this route BEFORE express.json so the body is preserved as a Buffer.
    this.express.use("/api/v1/webhooks", createWebhookRouter(this.escrowController));

    this.express.use(express.json({ limit: "10kb" }));
    this.express.use(express.urlencoded({ extended: true, limit: "10kb" }));
    this.express.use(cookieParser(env.COOKIE_SECRET));
  }

  private initialiseRoutes(): void {
    this.express.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    this.express.get("/health", (_req, res) => {
      res.status(200).json(
        new ApiResponse("OK", { service: "creatorlane-backend" }),
      );
    });

    this.express.use("/api/v1/auth/resend-otp", this.rateLimiter.resendOtp);
    this.express.use(
      "/api/v1/auth",
      this.rateLimiter.auth,
      createAuthRouter(this.authController, this.authMiddleware),
    );

    this.express.use(
      "/api/v1/campaigns",
      createCampaignRouter(this.campaignController, this.authMiddleware),
    );

    this.express.use(
      "/api/v1/bids",
      createBidRouter(this.bidController, this.authMiddleware),
    );

    this.express.use(
      "/api/v1/notifications",
      createNotificationRouter(this.bidController, this.authMiddleware),
    );

    this.express.use(
      "/api/v1/escrow",
      createEscrowRouter(this.escrowController, this.authMiddleware),
    );

    this.express.use(
      "/api/v1/collab",
      createCollabRouter(this.collabController, this.authMiddleware),
    );
  }

  private initialiseErrorHandling(): void {
    this.express.use(this.notFound.handle);
    this.express.use(this.errorHandler.handle);
  }
}
