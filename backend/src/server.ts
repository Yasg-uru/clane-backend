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

// ─── Repositories ─────────────────────────────────────────────────────────────
import { BrandRepository } from "./infrastructure/repositories/BrandRepository";
import { CreatorRepository } from "./infrastructure/repositories/CreatorRepository";

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

export class Server {
  private httpServer!: http.Server;
  private isShuttingDown = false;

  constructor(private readonly app: App) {}

  async start(): Promise<void> {
    const db = DatabaseConnection.getInstance();
    const redis = RedisClient.getInstance();
    const rabbitMQ = RabbitMQConnection.getInstance();

    await db.connect();
    await redis.connect();
    await rabbitMQ.connect();

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

const brandRepository = new BrandRepository();
const creatorRepository = new CreatorRepository();

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

const authMiddleware = new AuthMiddleware(tokenService);
const rateLimiter = new RateLimiterMiddleware(redis);
const errorHandler = new ErrorHandlerMiddleware();
const notFound = new NotFoundMiddleware();
const requestLogger = new RequestLoggerMiddleware();

const authController = new AuthController(brandAuthService, creatorAuthService, tokenService);

const app = new App(authController, authMiddleware, rateLimiter, errorHandler, notFound, requestLogger);
const server = new Server(app);

void server.start().catch((error: unknown) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
