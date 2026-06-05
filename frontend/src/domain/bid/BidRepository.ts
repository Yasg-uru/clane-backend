import { apiClient } from "@/lib/api/client";
import { BID_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types";
import type {
  BidWithCreator,
  BidWithCampaign,
  PaginatedBidsWithCreator,
  PaginatedBidsWithCampaign,
  SubmitBidPayload,
  CreatorBidFilters,
} from "@/types/bid.types";
import type { IBidRepository } from "./IBidRepository";

export class BidRepository implements IBidRepository {
  async submitBid(payload: SubmitBidPayload): Promise<BidWithCampaign> {
    const response = await apiClient.post<ApiResponse<{ bid: BidWithCampaign }>>(
      BID_ENDPOINTS.submit,
      payload,
    );
    return response.data.data.bid;
  }

  async getMyBids(filters: CreatorBidFilters): Promise<PaginatedBidsWithCampaign> {
    const response = await apiClient.get<ApiResponse<PaginatedBidsWithCampaign>>(
      BID_ENDPOINTS.myBids,
      { params: filters },
    );
    return response.data.data;
  }

  async getMyBidForCampaign(campaignId: string): Promise<BidWithCampaign | null> {
    try {
      const response = await apiClient.get<ApiResponse<{ bid: BidWithCampaign | null }>>(
        BID_ENDPOINTS.myBidForCampaign(campaignId),
      );
      return response.data.data.bid;
    } catch {
      return null;
    }
  }

  async withdrawBid(bidId: string): Promise<void> {
    await apiClient.delete(BID_ENDPOINTS.withdraw(bidId));
  }

  async getBidsForCampaign(campaignId: string): Promise<PaginatedBidsWithCreator> {
    const response = await apiClient.get<ApiResponse<PaginatedBidsWithCreator>>(
      BID_ENDPOINTS.forCampaign(campaignId),
    );
    return response.data.data;
  }

  async shortlistBid(bidId: string): Promise<BidWithCreator> {
    const response = await apiClient.post<ApiResponse<{ bid: BidWithCreator }>>(
      BID_ENDPOINTS.shortlist(bidId),
    );
    return response.data.data.bid;
  }

  async unshortlistBid(bidId: string): Promise<BidWithCreator> {
    const response = await apiClient.delete<ApiResponse<{ bid: BidWithCreator }>>(
      BID_ENDPOINTS.unshortlist(bidId),
    );
    return response.data.data.bid;
  }

  async declineBid(bidId: string): Promise<BidWithCreator> {
    const response = await apiClient.post<ApiResponse<{ bid: BidWithCreator }>>(
      BID_ENDPOINTS.decline(bidId),
    );
    return response.data.data.bid;
  }

  async acceptBid(bidId: string): Promise<BidWithCreator> {
    const response = await apiClient.post<ApiResponse<{ bid: BidWithCreator }>>(
      BID_ENDPOINTS.accept(bidId),
    );
    return response.data.data.bid;
  }
}
