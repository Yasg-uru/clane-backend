import type { IRepository } from "../../core/interfaces/IRepository";
import type { PaginatedResult } from "../../core/types";

export abstract class BaseRepository<T> implements IRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: Partial<Record<string, unknown>>): Promise<T>;
  abstract updateById(id: string, data: Partial<Record<string, unknown>>): Promise<T | null>;
  abstract deleteById(id: string): Promise<boolean>;

  protected buildPaginatedResult<U>(
    items: U[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<U> {
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }
}
