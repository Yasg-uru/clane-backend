import crypto from "crypto";
import type { ICacheService } from "../../core/interfaces/ICacheService";
import type { PaginatedResult } from "../../core/types";
import type { CampaignDocument } from "../../models/Campaign.model";
import type { BrowseFilters } from "../../infrastructure/repositories/CampaignRepository";
import type { CampaignWithMatch } from "./campaign.types";
import {
  BROWSE_CACHE_TTL_SECONDS,
  BRAND_LIST_CACHE_TTL_SECONDS,
  DETAIL_CACHE_TTL_SECONDS,
} from "./campaign.constants";

export class CampaignCacheManager {
  constructor(private readonly cache: ICacheService) {}

  async getBrowse(
    filters: BrowseFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CampaignWithMatch> | null> {
    return this.cache.get<PaginatedResult<CampaignWithMatch>>(this.browseKey(filters, page, limit));
  }

  async setBrowse(
    filters: BrowseFilters,
    page: number,
    limit: number,
    value: PaginatedResult<CampaignWithMatch>,
  ): Promise<void> {
    await this.cache.set(this.browseKey(filters, page, limit), value, BROWSE_CACHE_TTL_SECONDS);
  }

  async invalidateBrowse(): Promise<void> {
    await this.cache.delByPattern("cache:campaigns:browse:*");
  }

  async getBrandList(
    brandId: string,
    page: number,
  ): Promise<PaginatedResult<CampaignDocument> | null> {
    return this.cache.get<PaginatedResult<CampaignDocument>>(this.brandListKey(brandId, page));
  }

  async setBrandList(
    brandId: string,
    page: number,
    value: PaginatedResult<CampaignDocument>,
  ): Promise<void> {
    await this.cache.set(this.brandListKey(brandId, page), value, BRAND_LIST_CACHE_TTL_SECONDS);
  }

  async invalidateBrand(brandId: string): Promise<void> {
    await this.cache.delByPattern(`cache:campaigns:brand:${brandId}:*`);
  }

  async getDetail(slug: string): Promise<CampaignWithMatch | null> {
    return this.cache.get<CampaignWithMatch>(this.detailKey(slug));
  }

  async setDetail(slug: string, value: object): Promise<void> {
    await this.cache.set(this.detailKey(slug), value, DETAIL_CACHE_TTL_SECONDS);
  }

  async invalidateDetail(slug: string): Promise<void> {
    await this.cache.del(this.detailKey(slug));
  }

  private browseKey(filters: BrowseFilters, page: number, limit: number): string {
    const params = { ...filters, page, limit };
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(params, Object.keys(params).sort()))
      .digest("hex")
      .slice(0, 16);
    return `cache:campaigns:browse:${hash}`;
  }

  private brandListKey(brandId: string, page: number): string {
    return `cache:campaigns:brand:${brandId}:${page}`;
  }

  private detailKey(slug: string): string {
    return `cache:campaign:detail:${slug}`;
  }
}
