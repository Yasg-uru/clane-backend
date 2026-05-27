import mongoose, { type ClientSession, type FilterQuery, type SortOrder } from "mongoose";
import { BidModel, type BidDocument, type BidStatus } from "../../models/Bid.model";
import type { PaginatedResult } from "../../core/types";
import { BaseRepository } from "./BaseRepository";

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

export class BidRepository extends BaseRepository<BidDocument> {
  async findById(id: string): Promise<BidDocument | null> {
    return BidModel.findById(id).exec();
  }

  async findByEmail(_email: string): Promise<BidDocument | null> {
    return null;
  }

  async findByEmailWithSecrets(_email: string): Promise<BidDocument | null> {
    return null;
  }

  async findByIdWithRefreshToken(_id: string): Promise<BidDocument | null> {
    return null;
  }

  async emailExists(_email: string): Promise<boolean> {
    return false;
  }

  async create(data: Partial<Record<string, unknown>>): Promise<BidDocument> {
    const [bid] = await BidModel.create([data]);
    if (!bid) throw new Error("Failed to create bid");
    return bid;
  }

  async updateById(
    id: string,
    data: Partial<Record<string, unknown>>,
  ): Promise<BidDocument | null> {
    return BidModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await BidModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  async findByCampaignId(
    campaignId: string,
    filters: BidListFilters,
  ): Promise<PaginatedResult<BidDocument>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const query: FilterQuery<BidDocument> = { campaignId };
    if (filters.status) query.status = filters.status;
    if (filters.bidIds && filters.bidIds.length > 0) {
      query._id = { $in: filters.bidIds };
    }

    const sort = this.buildSort(filters.sortBy);

    const [total, items] = await Promise.all([
      BidModel.countDocuments(query),
      BidModel.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async findByCreatorId(
    creatorId: string,
    filters: CreatorBidFilters,
  ): Promise<PaginatedResult<BidDocument>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const query: FilterQuery<BidDocument> = { creatorId };
    if (filters.status) query.status = filters.status;

    const [total, items] = await Promise.all([
      BidModel.countDocuments(query),
      BidModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    return this.buildPaginatedResult(items, total, page, limit);
  }

  async findActiveByCreatorAndCampaign(
    creatorId: string,
    campaignId: string,
  ): Promise<BidDocument | null> {
    return BidModel.findOne({
      creatorId,
      campaignId,
      status: { $in: ["submitted", "shortlisted"] },
    }).exec();
  }

  async findAnyByCreatorAndCampaign(
    creatorId: string,
    campaignId: string,
  ): Promise<BidDocument | null> {
    return BidModel.findOne({ creatorId, campaignId }).exec();
  }

  async findAcceptedBidForCampaign(campaignId: string): Promise<BidDocument | null> {
    return BidModel.findOne({ campaignId, status: "accepted" }).exec();
  }

  async bulkDecline(
    campaignId: string,
    excludeBidId: string,
    session: ClientSession,
  ): Promise<Array<{ bidId: string; creatorId: string }>> {
    const toDecline = await BidModel.find(
      {
        campaignId,
        _id: { $ne: excludeBidId },
        status: { $in: ["submitted", "shortlisted"] },
      },
      { _id: 1, creatorId: 1 },
      { session },
    ).exec();

    if (toDecline.length === 0) return [];

    const ids = toDecline.map((b) => b._id);
    const now = new Date();

    await BidModel.updateMany(
      { _id: { $in: ids } },
      {
        status: "declined",
        autoDeclined: true,
        declinedAt: now,
      },
      { session },
    ).exec();

    return toDecline.map((b) => ({
      bidId: b._id.toString(),
      creatorId: b.creatorId.toString(),
    }));
  }

  async updateStatusWithSession(
    bidId: string,
    status: BidStatus,
    meta: Partial<Record<string, unknown>>,
    session: ClientSession,
  ): Promise<BidDocument | null> {
    return BidModel.findByIdAndUpdate(
      bidId,
      { status, ...meta },
      { new: true, session },
    ).exec();
  }

  async startSession(): Promise<ClientSession> {
    return mongoose.startSession();
  }

  async incrementCampaignBidCount(campaignId: string, session?: ClientSession): Promise<void> {
    const { CampaignModel } = await import("../../models/Campaign.model");
    await CampaignModel.updateOne(
      { _id: campaignId },
      { $inc: { totalBids: 1 } },
      { session },
    ).exec();
  }

  private buildSort(sortBy?: string): Record<string, SortOrder> {
    switch (sortBy) {
      case "amount_asc": return { proposedAmount: 1 };
      case "amount_desc": return { proposedAmount: -1 };
      case "submitted_at_desc": return { createdAt: -1 };
      default: return { createdAt: -1 };
    }
  }

  private buildPaginatedResult(
    items: BidDocument[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<BidDocument> {
    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
