import type { ClientSession } from "mongoose";
import type { CampaignDocument, CampaignStatus, ICampaign } from "../../models/Campaign.model";
import type { PaginatedResult, WriteData } from "../types";
import type { IRepository } from "./IRepository";

export interface CampaignListFilters {
  status?: CampaignStatus;
  page?: number;
  limit?: number;
}

export interface BrowseFilters {
  platform?: string;
  niche?: string[];
  budgetMin?: number;
  budgetMax?: number;
}

export interface ICampaignRepository extends IRepository<CampaignDocument, ICampaign> {
  findBySlug(slug: string): Promise<CampaignDocument | null>;
  findByBrandId(brandId: string, filters: CampaignListFilters): Promise<PaginatedResult<CampaignDocument>>;
  findActiveWithFilters(filters: BrowseFilters, page: number, limit: number): Promise<PaginatedResult<CampaignDocument>>;
  updateStatus(
    campaignId: string,
    status: CampaignStatus,
    meta?: WriteData<ICampaign>,
    session?: ClientSession,
  ): Promise<CampaignDocument | null>;
  incrementViewCount(campaignId: string): Promise<void>;
  findExpiredActiveCampaigns(): Promise<CampaignDocument[]>;
  slugExists(slug: string): Promise<boolean>;
}
