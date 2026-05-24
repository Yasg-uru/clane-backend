import Redis from "ioredis";
import { env } from "./env";
import { logger } from "../utils/logger";

const MAX_RETRIES = 5;

export class RedisClient {
  private static instance: RedisClient;
  private readonly redis: Redis;

  private constructor() {
    this.redis = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });
    this.redis.on("error", (error: Error) => {
      logger.error("Redis client error", { error });
    });
  }

  static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  async connect(): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
      try {
        if (this.redis.status === "wait") {
          await this.redis.connect();
        }
        await this.redis.ping();
        logger.info("Redis connected");
        return;
      } catch (error) {
        const delayMs = 2 ** (attempt - 1) * 1000;
        logger.error(`Redis connection attempt ${attempt} failed`, { error });
        if (attempt === MAX_RETRIES) throw error;
        await this.sleep(delayMs);
      }
    }
  }

  async quit(): Promise<void> {
    if (this.redis.status !== "end") {
      await this.redis.quit();
      logger.info("Redis connection closed");
    }
  }

  getStatus(): string {
    return this.redis.status;
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string, ex?: number): Promise<void> {
    if (ex !== undefined) {
      await this.redis.set(key, value, "EX", ex);
    } else {
      await this.redis.set(key, value);
    }
  }

  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return this.redis.exists(...keys);
  }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds);
  }

  async sendCommand(...args: string[]): Promise<unknown> {
    const [command, ...rest] = args;
    if (!command) throw new Error("Redis command is required");
    return this.redis.call(command, ...rest);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
