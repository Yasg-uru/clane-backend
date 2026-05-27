import http from "http";
import { DatabaseConnection } from "./config/DatabaseConnection";
import { RedisClient } from "./config/RedisClient";
import { RabbitMQConnection } from "./config/RabbitMQConnection";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { App } from "./app";

// ─── Infrastructure services ─────────────────────────────────────────────────
import { TokenService } from "./infrastructure/services/TokenService";
import { OtpService } from "./infrastructure/services/OtpService";
import { EmailService } from "./infrastructure/services/EmailService";
import { EventPublisher } from "./infrastructure/services/EventPublisher";
import { CacheService } from "./infrastructure/services/CacheService";

// ─── Repositories ─────────────────────────────────────────────────────────────
import { BrandRepository } from "./infrastructure/repositories/BrandRepository";
import { CreatorRepository } from "./infrastructure/repositories/CreatorRepository";
import { CampaignRepository } from "./infrastructure/repositories/CampaignRepository";
import { CreatorCampaignMatchRepository } from "./infrastructure/repositories/CreatorCampaignMatchRepository";

// ─── Middleware classes ───────────────────────────────────────────────────────
import { AuthMiddleware } from "./infrastructure/middleware/AuthMiddleware";
import { RateLimiterMiddleware } from "./infrastructure/middleware/RateLimiterMiddleware";
import { ErrorHandlerMiddleware } from "./infrastructure/middleware/ErrorHandlerMiddleware";
import { NotFoundMiddleware } from "./infrastructure/middleware/NotFoundMiddleware";
import { RequestLoggerMiddleware } from "./infrastructure/middleware/RequestLoggerMiddleware";

// ─── Auth module ──────────────────────────────────────────────────────────────
import { EmailPasswordStrategy } from "./modules/auth/strategies/EmailPasswordStrategy";
import { BrandAuthService } from "./modules/auth/BrandAuthService";
import { CreatorAuthService } from "./modules/auth/CreatorAuthService";
import { AuthController } from "./modules/auth/AuthController";

// ─── Campaign module ──────────────────────────────────────────────────────────
import { NicheScorer } from "./modules/campaign/scoring/NicheScorer";
import { PlatformScorer } from "./modules/campaign/scoring/PlatformScorer";
import { FollowerScorer } from "./modules/campaign/scoring/FollowerScorer";
import { LocationScorer } from "./modules/campaign/scoring/LocationScorer";
import { ProximityScorer } from "./modules/campaign/scoring/ProximityScorer";
import { RequirementsScorer } from "./modules/campaign/scoring/RequirementsScorer";
import { MatchScorer } from "./modules/campaign/scoring/MatchScorer";
import { CampaignService } from "./modules/campaign/CampaignService";
import { CampaignController } from "./modules/campaign/CampaignController";

// ─── Bid module ───────────────────────────────────────────────────────────────
import { LockService } from "./infrastructure/services/LockService";
import { BidRepository } from "./infrastructure/repositories/BidRepository";
import { NotificationRepository } from "./infrastructure/repositories/NotificationRepository";
import { BidService } from "./modules/bid/BidService";
import { BidController } from "./modules/bid/BidController";

// ─── Workers & jobs ───────────────────────────────────────────────────────────
import { MatchScoreWorker } from "./workers/MatchScoreWorker";
import { CampaignCleanupWorker } from "./workers/CampaignCleanupWorker";
import { ViewCountWorker } from "./workers/ViewCountWorker";
import { CampaignExpiryJob } from "./jobs/CampaignExpiryJob";
import { BidNotificationWorker } from "./workers/BidNotificationWorker";
import { EscrowInitWorker } from "./workers/EscrowInitWorker";

export class Server {
  private httpServer!: http.Server;
  private isShuttingDown = false;

  constructor(
    private readonly app: App,
    private readonly matchScoreWorker: MatchScoreWorker,
    private readonly campaignCleanupWorker: CampaignCleanupWorker,
    private readonly viewCountWorker: ViewCountWorker,
    private readonly campaignExpiryJob: CampaignExpiryJob,
    private readonly bidNotificationWorker: BidNotificationWorker,
    private readonly escrowInitWorker: EscrowInitWorker,
  ) {}

  async start(): Promise<void> {
    const db = DatabaseConnection.getInstance();
    const redis = RedisClient.getInstance();
    const rabbitMQ = RabbitMQConnection.getInstance();

    await db.connect();
    await redis.connect();
    await rabbitMQ.connect();

    await Promise.all([
      this.matchScoreWorker.start(),
      this.campaignCleanupWorker.start(),
      this.viewCountWorker.start(),
      this.bidNotificationWorker.start(),
      this.escrowInitWorker.start(),
    ]);

    this.campaignExpiryJob.start();

    this.httpServer = this.app.getExpressApp().listen(env.PORT, this.onListening);
    this.registerShutdownHandlers();
  }

  private onListening = (): void => {
    const mongoHost = new URL(env.MONGO_URI).host;
    const redisHost = new URL(env.REDIS_URL).host;
    const mqHost = new URL(env.RABBITMQ_URL).host;
    logger.info("CreatorLane API started", {
      NODE_ENV: env.NODE_ENV,
      port: env.PORT,
      mongo: mongoHost,
      redis: redisHost,
      rabbitmq: mqHost,
    });
  };

  private registerShutdownHandlers(): void {
    process.on("SIGINT", () => { void this.gracefulShutdown("SIGINT"); });
    process.on("SIGTERM", () => { void this.gracefulShutdown("SIGTERM"); });
    process.on("unhandledRejection", (reason) => {
      logger.error("Unhandled promise rejection", { reason });
      void this.gracefulShutdown("unhandledRejection");
    });
    process.on("uncaughtException", (error) => {
      logger.error("Uncaught exception", { error });
      void this.gracefulShutdown("uncaughtException");
    });
  }

  private async gracefulShutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    logger.info(`${signal} received. Shutting down gracefully.`);

    const forceExit = setTimeout(() => {
      logger.error("Graceful shutdown timed out. Forcing exit.");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    try {
      this.campaignExpiryJob.stop();

      await Promise.all([
        this.matchScoreWorker.stop(),
        this.campaignCleanupWorker.stop(),
        this.viewCountWorker.stop(),
        this.bidNotificationWorker.stop(),
        this.escrowInitWorker.stop(),
      ]);

      await this.closeHttpServer();

      const db = DatabaseConnection.getInstance();
      if (db.isConnected()) await db.disconnect();

      await RedisClient.getInstance().quit();
      await RabbitMQConnection.getInstance().disconnect();

      clearTimeout(forceExit);
      process.exit(0);
    } catch (error) {
      logger.error("Graceful shutdown failed", { error });
      clearTimeout(forceExit);
      process.exit(1);
    }
  }

  private closeHttpServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.httpServer) {
        resolve();
        return;
      }
      this.httpServer.closeAllConnections();
      this.httpServer.close((error) => {
        if (error) { reject(error); return; }
        resolve();
      });
    });
  }
}

// ─── Composition Root ─────────────────────────────────────────────────────────

const redis = RedisClient.getInstance();
const rabbitMQ = RabbitMQConnection.getInstance();

const tokenService = new TokenService(redis);
const otpService = new OtpService(redis);
const emailService = new EmailService();
const eventPublisher = new EventPublisher(rabbitMQ);
const cacheService = new CacheService(redis);

const brandRepository = new BrandRepository();
const creatorRepository = new CreatorRepository();
const campaignRepository = new CampaignRepository();
const creatorCampaignMatchRepository = new CreatorCampaignMatchRepository();

const emailPasswordStrategy = new EmailPasswordStrategy();

const brandAuthService = new BrandAuthService(
  brandRepository,
  tokenService,
  otpService,
  emailService,
  eventPublisher,
  emailPasswordStrategy,
);

const creatorAuthService = new CreatorAuthService(
  creatorRepository,
  tokenService,
  otpService,
  emailService,
  eventPublisher,
  emailPasswordStrategy,
);

const matchScorer = new MatchScorer(
  new NicheScorer(),
  new PlatformScorer(),
  new FollowerScorer(),
  new LocationScorer(),
  new ProximityScorer(),
  new RequirementsScorer(),
);

const campaignService = new CampaignService(
  campaignRepository,
  creatorCampaignMatchRepository,
  brandRepository,
  creatorRepository,
  eventPublisher,
  cacheService,
  matchScorer,
);

const authMiddleware = new AuthMiddleware(tokenService);
const rateLimiter = new RateLimiterMiddleware(redis);
const errorHandler = new ErrorHandlerMiddleware();
const notFound = new NotFoundMiddleware();
const requestLogger = new RequestLoggerMiddleware();

const authController = new AuthController(brandAuthService, creatorAuthService, tokenService);
const campaignController = new CampaignController(campaignService);

const lockService = new LockService(redis);

const bidRepository = new BidRepository();
const notificationRepository = new NotificationRepository();

const bidService = new BidService(
  bidRepository,
  campaignRepository,
  brandRepository,
  creatorRepository,
  creatorCampaignMatchRepository,
  eventPublisher,
  cacheService,
  lockService,
);

const bidController = new BidController(bidService, notificationRepository);

const matchScoreWorker = new MatchScoreWorker(creatorCampaignMatchRepository, creatorRepository, rabbitMQ, matchScorer);
const campaignCleanupWorker = new CampaignCleanupWorker(creatorCampaignMatchRepository, rabbitMQ);
const viewCountWorker = new ViewCountWorker(campaignRepository, rabbitMQ);
const campaignExpiryJob = new CampaignExpiryJob(campaignService);
const bidNotificationWorker = new BidNotificationWorker(notificationRepository, rabbitMQ);
const escrowInitWorker = new EscrowInitWorker(rabbitMQ);

const app = new App(
  authController,
  campaignController,
  bidController,
  authMiddleware,
  rateLimiter,
  errorHandler,
  notFound,
  requestLogger,
);

const server = new Server(
  app,
  matchScoreWorker,
  campaignCleanupWorker,
  viewCountWorker,
  campaignExpiryJob,
  bidNotificationWorker,
  escrowInitWorker,
);

void server.start().catch((error: unknown) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
