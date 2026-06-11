import type { RedisClient } from "../../config/RedisClient";
import type { ICacheService } from "../../core/interfaces/ICacheService";
import { logger } from "../../utils/logger";

export class CacheService implements ICacheService {
  constructor(private readonly redisClient: RedisClient) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redisClient.get(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      logger.warn("Cache parse error", { key });
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(key, JSON.stringify(value), ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await this.redisClient.scan(cursor, pattern, 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
      }
    } while (cursor !== "0");
  }
}
