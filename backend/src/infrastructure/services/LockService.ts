import crypto from "crypto";
import type { RedisClient } from "../../config/RedisClient";
import type { ILockService } from "../../core/interfaces/ILockService";
import { logger } from "../../utils/logger";

// Lua script that only deletes the key if the stored value matches the token.
// Prevents a process from releasing a lock it no longer owns after TTL expiry.
const RELEASE_SCRIPT = `
if redis.call("get", KEYS[1]) == ARGV[1] then
  return redis.call("del", KEYS[1])
else
  return 0
end
`;

// LockService owns the `lock:` Redis namespace. Callers pass a logical key
// (e.g. "bid:accept:<id>") and never spell out the prefix themselves.
const LOCK_KEY_PREFIX = "lock:";

export class LockService implements ILockService {
  constructor(private readonly redisClient: RedisClient) {}

  async acquire(key: string, ttlSeconds: number): Promise<string | null> {
    const token = crypto.randomBytes(16).toString("hex");
    const ttlMs = ttlSeconds * 1000;

    const result = await this.redisClient.sendCommand(
      "SET",
      this.namespaced(key),
      token,
      "NX",
      "PX",
      String(ttlMs),
    );

    if (result === "OK") return token;
    return null;
  }

  async release(key: string, lockToken: string): Promise<void> {
    try {
      await this.redisClient.sendCommand("EVAL", RELEASE_SCRIPT, "1", this.namespaced(key), lockToken);
    } catch (err) {
      logger.warn("LockService: failed to release lock", { key, err });
    }
  }

  private namespaced(key: string): string {
    return `${LOCK_KEY_PREFIX}${key}`;
  }
}
