import type { ICreatorRepository } from "../../core/interfaces/ICreatorRepository";
import type { PaginatedResult } from "../../core/types";
import { CreatorCacheManager } from "./CreatorCacheManager";
import { CreatorMapper } from "./CreatorMapper";
import type { CreatorBrowseFilters, CreatorBrowseView } from "./creator.types";

export class CreatorService {
  constructor(
    private readonly creatorRepository: ICreatorRepository,
    private readonly creatorCache: CreatorCacheManager,
  ) {}

  async browseCreators(
    filters: CreatorBrowseFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CreatorBrowseView>> {
    const cached = await this.creatorCache.getBrowse(filters, page, limit);
    if (cached) return cached;

    const result = await this.creatorRepository.findWithBrowseFilters(filters, page, limit);

    const paginated: PaginatedResult<CreatorBrowseView> = {
      items: result.items.map(CreatorMapper.toBrowseView),
      pagination: result.pagination,
    };

    await this.creatorCache.setBrowse(filters, page, limit, paginated);
    return paginated;
  }
}
