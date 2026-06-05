import { normalizeError } from "@/lib/api/error-handler";
import type {
  BidWithCreator,
  BidWithCampaign,
  PaginatedBidsWithCreator,
  PaginatedBidsWithCampaign,
  SubmitBidPayload,
  CreatorBidFilters,
} from "@/types/bid.types";
import type { IBidRepository } from "./IBidRepository";

export class BidService {
  constructor(private readonly repo: IBidRepository) {}

  async submitBid(payload: SubmitBidPayload): Promise<BidWithCampaign> {
    try {
      return await this.repo.submitBid(payload);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getMyBids(filters: CreatorBidFilters = {}): Promise<PaginatedBidsWithCampaign> {
    try {
      return await this.repo.getMyBids(filters);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getMyBidForCampaign(campaignId: string): Promise<BidWithCampaign | null> {
    try {
      return await this.repo.getMyBidForCampaign(campaignId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async withdrawBid(bidId: string): Promise<void> {
    try {
      await this.repo.withdrawBid(bidId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getBidsForCampaign(campaignId: string): Promise<PaginatedBidsWithCreator> {
    try {
      return await this.repo.getBidsForCampaign(campaignId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async shortlistBid(bidId: string): Promise<BidWithCreator> {
    try {
      return await this.repo.shortlistBid(bidId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async unshortlistBid(bidId: string): Promise<BidWithCreator> {
    try {
      return await this.repo.unshortlistBid(bidId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async declineBid(bidId: string): Promise<BidWithCreator> {
    try {
      return await this.repo.declineBid(bidId);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async acceptBid(bidId: string): Promise<BidWithCreator> {
    try {
      return await this.repo.acceptBid(bidId);
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
