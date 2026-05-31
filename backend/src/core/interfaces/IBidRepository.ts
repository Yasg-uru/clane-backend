import type { ClientSession } from "mongoose";
import type { BidDocument, BidStatus, IBid } from "../../models/Bid.model";
import type { PaginatedResult, WriteData } from "../types";
import type { IRepository } from "./IRepository";

export interface BidListFilters {
  status?: BidStatus;
  sortBy?: "amount_asc" | "amount_desc" | "match_score_desc" | "submitted_at_desc";
  bidIds?: string[];
  page?: number;
  limit?: number;
}

export interface CreatorBidFilters {
  status?: BidStatus;
  page?: number;
  limit?: number;
}

export interface IBidRepository extends IRepository<BidDocument, IBid> {
  findByCampaignId(campaignId: string, filters: BidListFilters): Promise<PaginatedResult<BidDocument>>;
  findByCreatorId(creatorId: string, filters: CreatorBidFilters): Promise<PaginatedResult<BidDocument>>;
  findActiveByCreatorAndCampaign(creatorId: string, campaignId: string): Promise<BidDocument | null>;
  findAnyByCreatorAndCampaign(creatorId: string, campaignId: string): Promise<BidDocument | null>;
  findAcceptedBidForCampaign(campaignId: string): Promise<BidDocument | null>;
  bulkDecline(
    campaignId: string,
    excludeBidId: string,
    session: ClientSession,
  ): Promise<Array<{ bidId: string; creatorId: string }>>;
  updateStatusWithSession(
    bidId: string,
    status: BidStatus,
    meta: WriteData<IBid>,
    session: ClientSession,
  ): Promise<BidDocument | null>;
  startSession(): Promise<ClientSession>;
  incrementCampaignBidCount(campaignId: string, session?: ClientSession): Promise<void>;
}
