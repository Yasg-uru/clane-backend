export interface ILockService {
  acquire(key: string, ttlSeconds: number): Promise<string | null>;
  release(key: string, lockToken: string): Promise<void>;
}
