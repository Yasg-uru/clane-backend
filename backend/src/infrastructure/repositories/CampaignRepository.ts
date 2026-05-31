import type { ClientSession, FilterQuery } from "mongoose";
import { CampaignModel, CampaignStatus, type CampaignDocument, type ICampaign } from "../../models/Campaign.model";
import type { PaginatedResult, WriteData } from "../../core/types";
import type {
  ICampaignRepository,
  CampaignListFilters,
  BrowseFilters,
} from "../../core/interfaces/ICampaignRepository";
import { BaseRepository } from "./BaseRepository";

export type { CampaignListFilters, BrowseFilters };

export class CampaignRepository
  extends BaseRepository<CampaignDocument, ICampaign>
  implements ICampaignRepository
{
  async findById(id: string): Promise<CampaignDocument | null> {
    return CampaignModel.findById(id).exec();
  }

  async create(data: WriteData<ICampaign>): Promise<CampaignDocument> {
    return CampaignModel.create(data);
  }

  async updateById(
    id: string,
    data: WriteData<ICampaign>,
  ): Promise<CampaignDocument | null> {
    return CampaignModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await CampaignModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findBySlug(slug: string): Promise<CampaignDocument | null> {
    return CampaignModel.findOne({ slug }).exec();
  }

  async findByBrandId(
    brandId: string,
    filters: CampaignListFilters,
  ): Promise<PaginatedResult<CampaignDocument>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const query: FilterQuery<CampaignDocument> = { brandId };
    if (filters.status) query.status = filters.status;

    const [total, items] = await Promise.all([
      CampaignModel.countDocuments(query),
      CampaignModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async findActiveWithFilters(
    filters: BrowseFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CampaignDocument>> {
    const query: FilterQuery<CampaignDocument> = { status: CampaignStatus.Active };

    if (filters.platform) query.platform = filters.platform;
    if (filters.niche && filters.niche.length > 0) {
      query.niche = { $in: filters.niche };
    }
    if (filters.budgetMin !== undefined || filters.budgetMax !== undefined) {
      const budgetFilter: { $gte?: number; $lte?: number } = {};
      if (filters.budgetMin !== undefined) budgetFilter.$gte = filters.budgetMin;
      if (filters.budgetMax !== undefined) budgetFilter.$lte = filters.budgetMax;
      query.budgetAmount = budgetFilter;
    }

    const [total, items] = await Promise.all([
      CampaignModel.countDocuments(query),
      CampaignModel.find(query)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async updateStatus(
    campaignId: string,
    status: CampaignStatus,
    meta?: WriteData<ICampaign>,
    session?: ClientSession,
  ): Promise<CampaignDocument | null> {
    return CampaignModel.findByIdAndUpdate(
      campaignId,
      { status, ...meta },
      { new: true, session },
    ).exec();
  }

  async incrementViewCount(campaignId: string): Promise<void> {
    await CampaignModel.updateOne(
      { _id: campaignId },
      { $inc: { viewCount: 1 } },
    ).exec();
  }

  async findExpiredActiveCampaigns(): Promise<CampaignDocument[]> {
    return CampaignModel.find({
      status: CampaignStatus.Active,
      deadline: { $lt: new Date() },
    }).exec();
  }

  async slugExists(slug: string): Promise<boolean> {
    return Boolean(await CampaignModel.exists({ slug }));
  }
}
