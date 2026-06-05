import { App } from "./app";
import { RabbitMQConnection } from "./config/RabbitMQConnection";
import { RedisClient } from "./config/RedisClient";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { AuthController } from "./modules/auth/AuthController";
import { BrandAuthService } from "./modules/auth/BrandAuthService";
import { CreatorAuthService } from "./modules/auth/CreatorAuthService";
import { EmailPasswordStrategy } from "./modules/auth/strategies/EmailPasswordStrategy";
import { GoogleStrategy } from "./modules/auth/strategies/GoogleStrategy";
import { InstagramStrategy } from "./modules/auth/strategies/InstagramStrategy";
import { YoutubeStrategy } from "./modules/auth/strategies/YoutubeStrategy";
import { InstagramGraphService } from "./infrastructure/services/InstagramGraphService";
import { YoutubeDataService } from "./infrastructure/services/YoutubeDataService";
import { AuthenticityScorer } from "./infrastructure/services/AuthenticityScorer";
import { BrandRepository } from "./infrastructure/repositories/BrandRepository";
import { CreatorRepository } from "./infrastructure/repositories/CreatorRepository";
import { CampaignRepository } from "./infrastructure/repositories/CampaignRepository";
import { BidRepository } from "./infrastructure/repositories/BidRepository";
import { EscrowRepository } from "./infrastructure/repositories/EscrowRepository";
import { CollabRoomRepository } from "./infrastructure/repositories/CollabRoomRepository";
import { CreatorCampaignMatchRepository } from "./infrastructure/repositories/CreatorCampaignMatchRepository";
import { NotificationRepository } from "./infrastructure/repositories/NotificationRepository";
import { AuthMiddleware } from "./infrastructure/middleware/AuthMiddleware";
import { SocialAuthMiddleware } from "./infrastructure/middleware/SocialAuthMiddleware";
import { ErrorHandlerMiddleware } from "./infrastructure/middleware/ErrorHandlerMiddleware";
import { NotFoundMiddleware } from "./infrastructure/middleware/NotFoundMiddleware";
import { RateLimiterMiddleware } from "./infrastructure/middleware/RateLimiterMiddleware";
import { RequestLoggerMiddleware } from "./infrastructure/middleware/RequestLoggerMiddleware";
import { CacheService } from "./infrastructure/services/CacheService";
import { EmailService } from "./infrastructure/services/EmailService";
import { EventPublisher } from "./infrastructure/services/EventPublisher";
import { LockService } from "./infrastructure/services/LockService";
import { OAuthStateService } from "./infrastructure/services/OAuthStateService";
import { OtpService } from "./infrastructure/services/OtpService";
import { RazorpayService } from "./infrastructure/services/RazorpayService";
import { TokenService } from "./infrastructure/services/TokenService";
import { CampaignService } from "./modules/campaign/CampaignService";
import { CampaignController } from "./modules/campaign/CampaignController";
import { CampaignCacheManager } from "./modules/campaign/CampaignCacheManager";
import { BidService } from "./modules/bid/BidService";
import { BidController } from "./modules/bid/BidController";
import { BidCacheManager } from "./modules/bid/BidCacheManager";
import { EscrowService } from "./modules/escrow/EscrowService";
import { EscrowController } from "./modules/escrow/EscrowController";
import { CollabController } from "./modules/collab/CollabController";
import { CollabService } from "./modules/collab/CollabService";
import { NotificationService } from "./modules/notification/NotificationService";
import { NotificationController } from "./modules/notification/NotificationController";
import { CreatorService } from "./modules/creator/CreatorService";
import { CreatorController } from "./modules/creator/CreatorController";
import { CreatorCacheManager } from "./modules/creator/CreatorCacheManager";
import { AccountLookupRepository } from "./infrastructure/repositories/AccountLookupRepository";
import { NicheScorer } from "./modules/campaign/scoring/NicheScorer";
import { PlatformScorer } from "./modules/campaign/scoring/PlatformScorer";
import { FollowerScorer } from "./modules/campaign/scoring/FollowerScorer";
import { LocationScorer } from "./modules/campaign/scoring/LocationScorer";
import { ProximityScorer } from "./modules/campaign/scoring/ProximityScorer";
import { RequirementsScorer } from "./modules/campaign/scoring/RequirementsScorer";
import { MatchScorer } from "./modules/campaign/scoring/MatchScorer";
import { MatchScoreWorker } from "./workers/MatchScoreWorker";
import { CampaignCleanupWorker } from "./workers/CampaignCleanupWorker";
import { ViewCountWorker } from "./workers/ViewCountWorker";
import { BidNotificationWorker } from "./workers/BidNotificationWorker";
import { EscrowInitWorker } from "./workers/EscrowInitWorker";
import { EscrowFundedWorker } from "./workers/EscrowFundedWorker";
import { InstagramDataWorker } from "./workers/InstagramDataWorker";
import { YoutubeDataWorker } from "./workers/YoutubeDataWorker";
import { AuthenticityScoreWorker } from "./workers/AuthenticityScoreWorker";
import { CampaignExpiryJob } from "./jobs/CampaignExpiryJob";
import { EscrowPaymentTimeoutJob } from "./jobs/EscrowPaymentTimeoutJob";
import { EscrowAutoRefundJob } from "./jobs/EscrowAutoRefundJob";
import { SocialDataRefreshJob } from "./jobs/SocialDataRefreshJob";
import { Server } from "./server";

const buildServer = (): Server => {
  const redis = RedisClient.getInstance();
  const rabbitMQ = RabbitMQConnection.getInstance();

  // ─── Infrastructure services ────────────────────────────────────────────────
  const tokenService = new TokenService(redis);
  const otpService = new OtpService(redis);
  const emailService = new EmailService();
  const eventPublisher = new EventPublisher(rabbitMQ);
  const oauthStateService = new OAuthStateService(redis);
  const cacheService = new CacheService(redis);
  const lockService = new LockService(redis);
  const razorpayService = new RazorpayService({
    keyId: env.RAZORPAY_KEY_ID,
    keySecret: env.RAZORPAY_KEY_SECRET,
    webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
    accountNumber: env.RAZORPAY_ACCOUNT_NUMBER,
  });

  // ─── Repositories ───────────────────────────────────────────────────────────
  const brandRepository = new BrandRepository();
  const creatorRepository = new CreatorRepository();
  const campaignRepository = new CampaignRepository();
  const bidRepository = new BidRepository();
  const escrowRepository = new EscrowRepository();
  const collabRoomRepository = new CollabRoomRepository();
  const creatorCampaignMatchRepository = new CreatorCampaignMatchRepository();
  const notificationRepository = new NotificationRepository();
  const accountLookupRepository = new AccountLookupRepository();

  // ─── Auth strategies ────────────────────────────────────────────────────────
  const emailPasswordStrategy = new EmailPasswordStrategy();
  const googleStrategy = new GoogleStrategy();
  const instagramStrategy = new InstagramStrategy();
  const youtubeStrategy = new YoutubeStrategy();

  // ─── Social verification services ──────────────────────────────────────────
  const instagramGraphService = new InstagramGraphService();
  const youtubeDataService = new YoutubeDataService();
  const authenticityScorer = new AuthenticityScorer();

  // ─── Cache managers ─────────────────────────────────────────────────────────
  const campaignCache = new CampaignCacheManager(cacheService);
  const bidCache = new BidCacheManager(cacheService);
  const creatorCache = new CreatorCacheManager(cacheService);

  // ─── Scorers ────────────────────────────────────────────────────────────────
  const matchScorer = new MatchScorer(
    new NicheScorer(),
    new PlatformScorer(),
    new FollowerScorer(),
    new LocationScorer(),
    new ProximityScorer(),
    new RequirementsScorer(),
  );

  // ─── Domain services ────────────────────────────────────────────────────────
  const brandAuthService = new BrandAuthService(
    brandRepository,
    tokenService,
    otpService,
    emailService,
    eventPublisher,
    emailPasswordStrategy,
    googleStrategy,
    instagramStrategy,
    oauthStateService,
    accountLookupRepository,
  );

  const creatorAuthService = new CreatorAuthService(
    creatorRepository,
    tokenService,
    otpService,
    emailService,
    eventPublisher,
    emailPasswordStrategy,
    googleStrategy,
    instagramStrategy,
    oauthStateService,
    accountLookupRepository,
    youtubeStrategy,
  );

  const campaignService = new CampaignService(
    campaignRepository,
    creatorCampaignMatchRepository,
    brandRepository,
    creatorRepository,
    eventPublisher,
    campaignCache,
    matchScorer,
  );

  const bidService = new BidService(
    bidRepository,
    campaignRepository,
    brandRepository,
    creatorRepository,
    creatorCampaignMatchRepository,
    eventPublisher,
    bidCache,
    lockService,
  );

  const escrowService = new EscrowService(
    escrowRepository,
    collabRoomRepository,
    bidRepository,
    campaignRepository,
    razorpayService,
    eventPublisher,
    notificationRepository,
    lockService,
    cacheService,
  );

  // ─── Controllers ────────────────────────────────────────────────────────────
  const authMiddleware = new AuthMiddleware(tokenService);
  const socialAuthMiddleware = new SocialAuthMiddleware(tokenService);
  const rateLimiter = new RateLimiterMiddleware(redis);
  const errorHandler = new ErrorHandlerMiddleware();
  const notFound = new NotFoundMiddleware();
  const requestLogger = new RequestLoggerMiddleware();

  const authController = new AuthController(
    brandAuthService,
    creatorAuthService,
    tokenService,
  );

  const collabService = new CollabService(collabRoomRepository);
  const notificationService = new NotificationService(notificationRepository);
  const creatorBrowseService = new CreatorService(creatorRepository, creatorCache);

  const campaignController = new CampaignController(campaignService);
  const bidController = new BidController(bidService);
  const escrowController = new EscrowController(escrowService);
  const collabController = new CollabController(collabService);
  const notificationController = new NotificationController(notificationService);
  const creatorController = new CreatorController(creatorBrowseService);

  // ─── Workers & Jobs ─────────────────────────────────────────────────────────
  const matchScoreWorker = new MatchScoreWorker(
    creatorCampaignMatchRepository,
    creatorRepository,
    rabbitMQ,
    matchScorer,
  );
  const campaignCleanupWorker = new CampaignCleanupWorker(creatorCampaignMatchRepository, rabbitMQ);
  const viewCountWorker = new ViewCountWorker(campaignRepository, rabbitMQ);
  const bidNotificationWorker = new BidNotificationWorker(notificationRepository, rabbitMQ);
  const escrowInitWorker = new EscrowInitWorker(rabbitMQ, escrowService);
  const escrowFundedWorker = new EscrowFundedWorker(escrowService, notificationRepository, rabbitMQ);
  const campaignExpiryJob = new CampaignExpiryJob(campaignService);
  const escrowPaymentTimeoutJob = new EscrowPaymentTimeoutJob(escrowRepository, escrowService);
  const escrowAutoRefundJob = new EscrowAutoRefundJob(escrowRepository, escrowService);

  const instagramDataWorker = new InstagramDataWorker(
    creatorRepository,
    instagramGraphService,
    eventPublisher,
    rabbitMQ,
  );
  const youtubeDataWorker = new YoutubeDataWorker(
    creatorRepository,
    youtubeDataService,
    eventPublisher,
    rabbitMQ,
  );
  const authenticityScoreWorker = new AuthenticityScoreWorker(
    creatorRepository,
    authenticityScorer,
    rabbitMQ,
  );
  const socialDataRefreshJob = new SocialDataRefreshJob(creatorRepository, eventPublisher);

  const app = new App(
    authController,
    campaignController,
    bidController,
    escrowController,
    collabController,
    notificationController,
    creatorController,
    authMiddleware,
    socialAuthMiddleware,
    rateLimiter,
    errorHandler,
    notFound,
    requestLogger,
  );

  return new Server(
    app,
    matchScoreWorker,
    campaignCleanupWorker,
    viewCountWorker,
    campaignExpiryJob,
    bidNotificationWorker,
    escrowInitWorker,
    escrowFundedWorker,
    escrowPaymentTimeoutJob,
    escrowAutoRefundJob,
    instagramDataWorker,
    youtubeDataWorker,
    authenticityScoreWorker,
    socialDataRefreshJob,
  );
};

const server = buildServer();

void server.start().catch((error: unknown) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
