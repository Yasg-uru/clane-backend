import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

const MAX_RETRIES = 5;

export const redisClient = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redisClient.on("error", (error: Error) => {
  logger.error("Redis client error", { error });
});

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

export const connectRedis = async (): Promise<void> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      if (redisClient.status === "wait") {
        await redisClient.connect();
      }

      await redisClient.ping();
      logger.info("Redis connected");
      return;
    } catch (error) {
      const delayMs = 2 ** (attempt - 1) * 1000;
      logger.error(`Redis connection attempt ${attempt} failed`, { error });

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await sleep(delayMs);
    }
  }
};

export const quitRedis = async (): Promise<void> => {
  if (redisClient.status !== "end") {
    await redisClient.quit();
    logger.info("Redis connection closed");
  }
};
