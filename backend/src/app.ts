import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { ApiResponse } from "./core/responses/ApiResponse";
import type { AuthController } from "./modules/auth/AuthController";
import type { CampaignController } from "./modules/campaign/CampaignController";
import type { BidController } from "./modules/bid/BidController";
import type { AuthMiddleware } from "./infrastructure/middleware/AuthMiddleware";
import type { RateLimiterMiddleware } from "./infrastructure/middleware/RateLimiterMiddleware";
import type { ErrorHandlerMiddleware } from "./infrastructure/middleware/ErrorHandlerMiddleware";
import type { NotFoundMiddleware } from "./infrastructure/middleware/NotFoundMiddleware";
import type { RequestLoggerMiddleware } from "./infrastructure/middleware/RequestLoggerMiddleware";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { createCampaignRouter } from "./modules/campaign/campaign.routes";
import { createBidRouter, createNotificationRouter } from "./modules/bid/bid.routes";

export class App {
  private readonly express: Application;

  constructor(
    private readonly authController: AuthController,
    private readonly campaignController: CampaignController,
    private readonly bidController: BidController,
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
    this.express.use(helmet());
    this.express.use(
      cors({
        origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
        credentials: true,
      }),
    );
    this.express.use(this.requestLogger.handle);
    this.express.use(express.json({ limit: "10kb" }));
    this.express.use(express.urlencoded({ extended: true, limit: "10kb" }));
    this.express.use(cookieParser(env.COOKIE_SECRET));
  }

  private initialiseRoutes(): void {
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
  }

  private initialiseErrorHandling(): void {
    this.express.use(this.notFound.handle);
    this.express.use(this.errorHandler.handle);
  }
}
