import type { IRepository } from "../../core/interfaces/IRepository";

export abstract class BaseRepository<T> implements IRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract findByEmail(email: string): Promise<T | null>;
  abstract findByEmailWithSecrets(email: string): Promise<T | null>;
  abstract findByIdWithRefreshToken(id: string): Promise<T | null>;
  abstract emailExists(email: string): Promise<boolean>;
  abstract create(data: Partial<Record<string, unknown>>): Promise<T>;
  abstract updateById(id: string, data: Partial<Record<string, unknown>>): Promise<T | null>;
  abstract deleteById(id: string): Promise<boolean>;
}
