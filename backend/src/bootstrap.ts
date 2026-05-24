import { App } from "./app";
import { RabbitMQConnection } from "./config/RabbitMQConnection";
import { RedisClient } from "./config/RedisClient";
import { logger } from "./utils/logger";
import { AuthController } from "./modules/auth/AuthController";
import { BrandAuthService } from "./modules/auth/BrandAuthService";
import { CreatorAuthService } from "./modules/auth/CreatorAuthService";
import { EmailPasswordStrategy } from "./modules/auth/strategies/EmailPasswordStrategy";
import { GoogleStrategy } from "./modules/auth/strategies/GoogleStrategy";
import { InstagramStrategy } from "./modules/auth/strategies/InstagramStrategy";
import { BrandRepository } from "./infrastructure/repositories/BrandRepository";
import { CreatorRepository } from "./infrastructure/repositories/CreatorRepository";
import { AuthMiddleware } from "./infrastructure/middleware/AuthMiddleware";
import { ErrorHandlerMiddleware } from "./infrastructure/middleware/ErrorHandlerMiddleware";
import { NotFoundMiddleware } from "./infrastructure/middleware/NotFoundMiddleware";
import { RateLimiterMiddleware } from "./infrastructure/middleware/RateLimiterMiddleware";
import { RequestLoggerMiddleware } from "./infrastructure/middleware/RequestLoggerMiddleware";
import { EmailService } from "./infrastructure/services/EmailService";
import { EventPublisher } from "./infrastructure/services/EventPublisher";
import { OAuthStateService } from "./infrastructure/services/OAuthStateService";
import { OtpService } from "./infrastructure/services/OtpService";
import { TokenService } from "./infrastructure/services/TokenService";
import { Server } from "./server";

const buildServer = (): Server => {
  const redis = RedisClient.getInstance();
  const rabbitMQ = RabbitMQConnection.getInstance();

  const tokenService = new TokenService(redis);
  const otpService = new OtpService(redis);
  const emailService = new EmailService();
  const eventPublisher = new EventPublisher(rabbitMQ);
  const oauthStateService = new OAuthStateService(redis);

  const brandRepository = new BrandRepository();
  const creatorRepository = new CreatorRepository();

  const emailPasswordStrategy = new EmailPasswordStrategy();
  const googleStrategy = new GoogleStrategy();
  const instagramStrategy = new InstagramStrategy();

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
  );

  const authMiddleware = new AuthMiddleware(tokenService);
  const rateLimiter = new RateLimiterMiddleware(redis);
  const errorHandler = new ErrorHandlerMiddleware();
  const notFound = new NotFoundMiddleware();
  const requestLogger = new RequestLoggerMiddleware();

  const authController = new AuthController(
    brandAuthService,
    creatorAuthService,
    tokenService,
  );

  const app = new App(
    authController,
    authMiddleware,
    rateLimiter,
    errorHandler,
    notFound,
    requestLogger,
  );

  return new Server(app);
};

const server = buildServer();

void server.start().catch((error: unknown) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
