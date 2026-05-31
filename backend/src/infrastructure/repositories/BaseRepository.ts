import type { IRepository } from "../../core/interfaces/IRepository";
import type { PaginatedResult, WriteData } from "../../core/types";

export abstract class BaseRepository<TDoc, TEntity = TDoc>
  implements IRepository<TDoc, TEntity>
{
  abstract findById(id: string): Promise<TDoc | null>;
  abstract create(data: WriteData<TEntity>): Promise<TDoc>;
  abstract updateById(id: string, data: WriteData<TEntity>): Promise<TDoc | null>;
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
