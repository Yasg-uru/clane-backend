import crypto from "crypto";
import type { ICacheService } from "../../core/interfaces/ICacheService";
import type { PaginatedResult } from "../../core/types";
import type { BidListFilters } from "../../infrastructure/repositories/BidRepository";
import type { BidWithCreator, BidWithCampaign } from "./bid.types";

const BID_LIST_TTL_SECONDS = 60;
const CREATOR_BIDS_TTL_SECONDS = 120;

export class BidCacheManager {
  constructor(private readonly cache: ICacheService) {}

  async getBidList(
    campaignId: string,
    filters: BidListFilters,
  ): Promise<PaginatedResult<BidWithCreator> | null> {
    return this.cache.get<PaginatedResult<BidWithCreator>>(this.bidListKey(campaignId, filters));
  }

  async setBidList(
    campaignId: string,
    filters: BidListFilters,
    value: PaginatedResult<BidWithCreator>,
  ): Promise<void> {
    await this.cache.set(this.bidListKey(campaignId, filters), value, BID_LIST_TTL_SECONDS);
  }

  async invalidateBidList(campaignId: string): Promise<void> {
    await this.cache.delByPattern(`cache:bids:campaign:${campaignId}:*`);
  }

  async getCreatorBids(
    creatorId: string,
    page: number,
  ): Promise<PaginatedResult<BidWithCampaign> | null> {
    return this.cache.get<PaginatedResult<BidWithCampaign>>(this.creatorBidsKey(creatorId, page));
  }

  async setCreatorBids(
    creatorId: string,
    page: number,
    value: PaginatedResult<BidWithCampaign>,
  ): Promise<void> {
    await this.cache.set(this.creatorBidsKey(creatorId, page), value, CREATOR_BIDS_TTL_SECONDS);
  }

  async invalidateCreatorBids(creatorId: string): Promise<void> {
    await this.cache.delByPattern(`cache:bids:creator:${creatorId}:*`);
  }

  private bidListKey(campaignId: string, filters: BidListFilters): string {
    const params = { ...filters };
    delete params.bidIds;
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(params, Object.keys(params).sort()))
      .digest("hex")
      .slice(0, 16);
    return `cache:bids:campaign:${campaignId}:${hash}`;
  }

  private creatorBidsKey(creatorId: string, page: number): string {
    return `cache:bids:creator:${creatorId}:${page}`;
  }
}
