import http from "http";
import { DatabaseConnection } from "./config/DatabaseConnection";
import { RedisClient } from "./config/RedisClient";
import { RabbitMQConnection } from "./config/RabbitMQConnection";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { App } from "./app";
import type { MatchScoreWorker } from "./workers/MatchScoreWorker";
import type { CampaignCleanupWorker } from "./workers/CampaignCleanupWorker";
import type { ViewCountWorker } from "./workers/ViewCountWorker";
import type { BidNotificationWorker } from "./workers/BidNotificationWorker";
import type { EscrowInitWorker } from "./workers/EscrowInitWorker";
import type { EscrowFundedWorker } from "./workers/EscrowFundedWorker";
import type { CampaignExpiryJob } from "./jobs/CampaignExpiryJob";
import type { EscrowPaymentTimeoutJob } from "./jobs/EscrowPaymentTimeoutJob";
import type { EscrowAutoRefundJob } from "./jobs/EscrowAutoRefundJob";

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
    private readonly escrowFundedWorker: EscrowFundedWorker,
    private readonly escrowPaymentTimeoutJob: EscrowPaymentTimeoutJob,
    private readonly escrowAutoRefundJob: EscrowAutoRefundJob,
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
      this.escrowFundedWorker.start(),
    ]);

    this.campaignExpiryJob.start();
    this.escrowPaymentTimeoutJob.start();
    this.escrowAutoRefundJob.start();

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
      this.escrowPaymentTimeoutJob.stop();
      this.escrowAutoRefundJob.stop();

      await Promise.all([
        this.matchScoreWorker.stop(),
        this.campaignCleanupWorker.stop(),
        this.viewCountWorker.stop(),
        this.bidNotificationWorker.stop(),
        this.escrowInitWorker.stop(),
        this.escrowFundedWorker.stop(),
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
