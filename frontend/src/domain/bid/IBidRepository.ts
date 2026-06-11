import type {
  BidWithCreator,
  BidWithCampaign,
  PaginatedBidsWithCreator,
  PaginatedBidsWithCampaign,
  SubmitBidPayload,
  CreatorBidFilters,
} from "@/types/bid.types";

export interface IBidRepository {
  submitBid(payload: SubmitBidPayload): Promise<BidWithCampaign>;
  getMyBids(filters: CreatorBidFilters): Promise<PaginatedBidsWithCampaign>;
  getMyBidForCampaign(campaignId: string): Promise<BidWithCampaign | null>;
  withdrawBid(bidId: string): Promise<void>;
  getBidsForCampaign(campaignId: string): Promise<PaginatedBidsWithCreator>;
  shortlistBid(bidId: string): Promise<BidWithCreator>;
  unshortlistBid(bidId: string): Promise<BidWithCreator>;
  declineBid(bidId: string): Promise<BidWithCreator>;
  acceptBid(bidId: string): Promise<BidWithCreator>;
}
