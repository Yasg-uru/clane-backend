import type { Server } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { connectDB, disconnectDB } from "./config/db";
import { closeRabbitMQ, connectRabbitMQ } from "./config/rabbitmq";
import { connectRedis, quitRedis } from "./config/redis";
import { env } from "./config/env";
import { logger } from "./utils/logger";

let server: Server | null = null;
let isShuttingDown = false;

const startServer = async (): Promise<void> => {
  await connectDB();
  await connectRedis();
  await connectRabbitMQ();

  server = app.listen(env.PORT, () => {
    // Log host-only portions of connection URLs to avoid leaking credentials.
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
  });
};

const closeHttpServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    // [MEDIUM] closeAllConnections drops keep-alive connections so shutdown is not blocked.
    server.closeAllConnections();
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
};

const shutdown = async (signal: string): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info(`${signal} received. Shutting down gracefully.`);

  // [MEDIUM] Force-exit after 10 s if any step hangs.
  const forceExit = setTimeout(() => {
    logger.error("Graceful shutdown timed out. Forcing exit.");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await closeHttpServer();

    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }

    await quitRedis();
    await closeRabbitMQ();
    clearTimeout(forceExit);
    process.exit(0);
  } catch (error) {
    logger.error("Graceful shutdown failed", { error });
    clearTimeout(forceExit);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
  void shutdown("unhandledRejection");
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  void shutdown("uncaughtException");
});

void startServer().catch((error: unknown) => {
  logger.error("Failed to start server", { error });
  process.exit(1);
});
