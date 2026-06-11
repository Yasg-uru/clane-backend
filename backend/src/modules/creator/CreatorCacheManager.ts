import crypto from "crypto";
import type { ICacheService } from "../../core/interfaces/ICacheService";
import type { PaginatedResult } from "../../core/types";
import type { CreatorBrowseFilters, CreatorBrowseView } from "./creator.types";

const BROWSE_TTL_SECONDS = 300;

export class CreatorCacheManager {
  constructor(private readonly cache: ICacheService) {}

  async getBrowse(
    filters: CreatorBrowseFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CreatorBrowseView> | null> {
    return this.cache.get<PaginatedResult<CreatorBrowseView>>(this.browseKey(filters, page, limit));
  }

  async setBrowse(
    filters: CreatorBrowseFilters,
    page: number,
    limit: number,
    value: PaginatedResult<CreatorBrowseView>,
  ): Promise<void> {
    await this.cache.set(this.browseKey(filters, page, limit), value, BROWSE_TTL_SECONDS);
  }

  async invalidateBrowse(): Promise<void> {
    await this.cache.delByPattern("cache:creators:browse:*");
  }

  private browseKey(filters: CreatorBrowseFilters, page: number, limit: number): string {
    const params = { ...filters, page, limit };
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(params, Object.keys(params).sort()))
      .digest("hex")
      .slice(0, 16);
    return `cache:creators:browse:${hash}`;
  }
}
