import type { BidDocument } from "../../models/Bid.model";
import type { PaginatedResult } from "../../core/types";
import type { BidRepository, BidListFilters, CreatorBidFilters } from "../../infrastructure/repositories/BidRepository";
import type { CampaignRepository } from "../../infrastructure/repositories/CampaignRepository";
import type { BrandRepository } from "../../infrastructure/repositories/BrandRepository";
import type { CreatorRepository } from "../../infrastructure/repositories/CreatorRepository";
import type { CreatorCampaignMatchRepository } from "../../infrastructure/repositories/CreatorCampaignMatchRepository";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { ILockService } from "../../core/interfaces/ILockService";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ValidationError } from "../../core/errors/ValidationError";
import { ConflictError } from "../../core/errors/ConflictError";
import { ForbiddenError } from "../../core/errors/ForbiddenError";
import { BID_EXCHANGE_NAME, BidEvent } from "../../config/config.constants";
import { BID_LOCK_TTL_SECONDS, BUDGET_MIN_RATIO, BUDGET_MAX_RATIO } from "./bid.constants";
import { BidCacheManager } from "./BidCacheManager";
import type { BidWithCreator, BidWithCampaign, AcceptBidResult } from "./bid.types";
import type { SubmitBidInput } from "./bid.validator";
import { BidStatus } from "../../models/Bid.model";
import { CampaignStatus } from "../../models/Campaign.model";

export class BidService {
  constructor(
    private readonly bidRepository: BidRepository,
    private readonly campaignRepository: CampaignRepository,
    private readonly brandRepository: BrandRepository,
    private readonly creatorRepository: CreatorRepository,
    private readonly creatorCampaignMatchRepository: CreatorCampaignMatchRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly bidCache: BidCacheManager,
    private readonly lockService: ILockService,
  ) {}

  // ─── Creator-facing ────────────────────────────────────────────────────────

  async submitBid(creatorId: string, data: SubmitBidInput): Promise<BidDocument> {
    const campaign = await this.campaignRepository.findById(data.campaignId);
    if (!campaign || campaign.status !== CampaignStatus.Active) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }

    if (campaign.deadline < new Date()) {
      throw new ValidationError("Campaign deadline has passed", "CAMPAIGN_DEADLINE_PASSED");
    }

    const creator = await this.creatorRepository.findById(creatorId);
    if (!creator) throw new NotFoundError("Creator not found", "CREATOR_NOT_FOUND");

    if (!creator.isEmailVerified) {
      throw new ForbiddenError("Creator profile is incomplete or unverified", "CREATOR_PROFILE_INCOMPLETE");
    }

    const minAmount = Math.ceil(campaign.budgetAmount * BUDGET_MIN_RATIO);
    const maxAmount = Math.floor(campaign.budgetAmount * BUDGET_MAX_RATIO);
    if (data.proposedAmount < minAmount || data.proposedAmount > maxAmount) {
      throw new ValidationError(
        `Proposed amount must be between ₹${minAmount} and ₹${maxAmount}`,
        "BID_AMOUNT_OUT_OF_RANGE",
      );
    }

    const existing = await this.bidRepository.findAnyByCreatorAndCampaign(creatorId, data.campaignId);
    if (existing) {
      throw new ConflictError("You have already bid on this campaign", "BID_ALREADY_EXISTS");
    }

    const bid = await this.bidRepository.create({
      campaignId: data.campaignId,
      creatorId,
      brandId: campaign.brandId.toString(),
      proposedAmount: data.proposedAmount,
      pitch: data.pitch,
      attachmentUrl: data.attachmentUrl ?? null,
      proposedTimeline: data.proposedTimeline,
      status: BidStatus.Submitted,
      campaignBudgetAtBid: campaign.budgetAmount,
      campaignDeadlineAtBid: campaign.deadline,
      campaignTitleAtBid: campaign.title,
    });

    await this.bidRepository.incrementCampaignBidCount(data.campaignId);

    this.eventPublisher.publish(
      BidEvent.Submitted,
      {
        bidId: bid._id.toString(),
        campaignId: data.campaignId,
        creatorId,
        brandId: campaign.brandId.toString(),
        proposedAmount: data.proposedAmount,
        pitch: data.pitch,
      },
      BID_EXCHANGE_NAME,
    );

    await this.bidCache.invalidateBidList(data.campaignId);

    return bid;
  }

  async withdrawBid(creatorId: string, bidId: string, reason?: string): Promise<BidDocument> {
    const bid = await this.bidRepository.findById(bidId);
    if (!bid || bid.creatorId.toString() !== creatorId) {
      throw new NotFoundError("Bid not found", "BID_NOT_FOUND");
    }

    if (bid.status !== BidStatus.Submitted && bid.status !== BidStatus.Shortlisted) {
      throw new ValidationError("Bid cannot be withdrawn in its current state", "BID_NOT_ACTIONABLE");
    }

    const updated = await this.bidRepository.updateById(bidId, {
      status: BidStatus.Withdrawn,
      withdrawReason: reason ?? null,
      withdrawnAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    this.eventPublisher.publish(
      BidEvent.Withdrawn,
      {
        bidId,
        campaignId: bid.campaignId.toString(),
        creatorId,
        brandId: bid.brandId.toString(),
      },
      BID_EXCHANGE_NAME,
    );

    await Promise.all([
      this.bidCache.invalidateBidList(bid.campaignId.toString()),
      this.bidCache.invalidateCreatorBids(creatorId),
    ]);

    return updated;
  }

  async getCreatorBids(
    creatorId: string,
    filters: CreatorBidFilters,
  ): Promise<PaginatedResult<BidWithCampaign>> {
    const page = filters.page ?? 1;
    const cached = await this.bidCache.getCreatorBids(creatorId, page);
    if (cached) return cached;

    const result = await this.bidRepository.findByCreatorId(creatorId, filters);
    const campaignIds = [...new Set(result.items.map((b) => b.campaignId.toString()))];

    const campaigns = await Promise.all(
      campaignIds.map((id) => this.campaignRepository.findById(id)),
    );
    const campaignMap = new Map<string, { title: string; platform: string; brandId: string }>();
    for (const c of campaigns) {
      if (c) campaignMap.set(c._id.toString(), { title: c.title, platform: c.platform, brandId: c.brandId.toString() });
    }

    const brandIds = [...new Set([...campaignMap.values()].map((c) => c.brandId))];
    const brands = await Promise.all(
      brandIds.map((id) => this.brandRepository.findById(id).catch(() => null)),
    );
    const brandNameMap = new Map<string, string>();
    for (const b of brands) {
      if (b) brandNameMap.set(b._id.toString(), b.brandName ?? b.fullName ?? "Unknown Brand");
    }

    const items: BidWithCampaign[] = result.items.map((bid) => {
      const campaignInfo = campaignMap.get(bid.campaignId.toString());
      return {
        _id: bid._id.toString(),
        campaignId: bid.campaignId.toString(),
        brandId: bid.brandId.toString(),
        proposedAmount: bid.proposedAmount,
        pitch: bid.pitch,
        attachmentUrl: bid.attachmentUrl,
        proposedTimeline: bid.proposedTimeline,
        status: bid.status,
        declineReason: bid.declineReason,
        withdrawReason: bid.withdrawReason,
        autoDeclined: bid.autoDeclined,
        shortlistedAt: bid.shortlistedAt,
        acceptedAt: bid.acceptedAt,
        declinedAt: bid.declinedAt,
        withdrawnAt: bid.withdrawnAt,
        campaignBudgetAtBid: bid.campaignBudgetAtBid,
        campaignDeadlineAtBid: bid.campaignDeadlineAtBid,
        campaignTitleAtBid: bid.campaignTitleAtBid,
        createdAt: bid.createdAt ?? new Date(),
        updatedAt: bid.updatedAt ?? new Date(),
        campaignTitle: campaignInfo?.title ?? bid.campaignTitleAtBid,
        campaignPlatform: campaignInfo?.platform ?? "unknown",
        brandName: brandNameMap.get(bid.brandId.toString()) ?? "Unknown Brand",
      };
    });

    const enriched: PaginatedResult<BidWithCampaign> = { items, pagination: result.pagination };
    await this.bidCache.setCreatorBids(creatorId, page, enriched);
    return enriched;
  }

  async getCreatorBidForCampaign(
    creatorId: string,
    campaignId: string,
  ): Promise<BidDocument | null> {
    return this.bidRepository.findActiveByCreatorAndCampaign(creatorId, campaignId);
  }

  // ─── Brand-facing ──────────────────────────────────────────────────────────

  async getBidsForCampaign(
    brandId: string,
    campaignId: string,
    filters: BidListFilters,
  ): Promise<PaginatedResult<BidWithCreator>> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }

    if (!filters.bidIds || filters.bidIds.length === 0) {
      const cached = await this.bidCache.getBidList(campaignId, filters);
      if (cached) return cached;
    }

    const result = await this.bidRepository.findByCampaignId(campaignId, filters);

    const creatorIds = result.items.map((b) => b.creatorId.toString());
    const [creators, matchScoreMap] = await Promise.all([
      this.creatorRepository.findByIds(creatorIds),
      this.creatorCampaignMatchRepository.findMatchesForCampaign(campaignId, creatorIds),
    ]);

    const creatorMap = new Map(creators.map((c) => [c._id.toString(), c]));

    let items: BidWithCreator[] = result.items.map((bid) => {
      const creator = creatorMap.get(bid.creatorId.toString());
      const matchScore = matchScoreMap.get(bid.creatorId.toString());
      return {
        _id: bid._id.toString(),
        campaignId: bid.campaignId.toString(),
        brandId: bid.brandId.toString(),
        proposedAmount: bid.proposedAmount,
        pitch: bid.pitch,
        attachmentUrl: bid.attachmentUrl,
        proposedTimeline: bid.proposedTimeline,
        status: bid.status,
        declineReason: bid.declineReason,
        autoDeclined: bid.autoDeclined,
        shortlistedAt: bid.shortlistedAt,
        acceptedAt: bid.acceptedAt,
        declinedAt: bid.declinedAt,
        campaignBudgetAtBid: bid.campaignBudgetAtBid,
        campaignDeadlineAtBid: bid.campaignDeadlineAtBid,
        campaignTitleAtBid: bid.campaignTitleAtBid,
        createdAt: bid.createdAt ?? new Date(),
        updatedAt: bid.updatedAt ?? new Date(),
        creator: {
          id: creator?._id.toString() ?? bid.creatorId.toString(),
          fullName: creator?.fullName ?? "",
          instagramHandle: creator?.instagramHandle ?? "",
          instagramFollowers: creator?.instagramFollowers ?? 0,
          niche: creator?.niche ?? [],
          city: creator?.city ?? "",
          instagramProfilePicUrl: creator?.instagramProfilePicUrl,
          matchScore,
        },
      };
    });

    if (filters.sortBy === "match_score_desc") {
      items = items.sort((a, b) => (b.creator.matchScore ?? 0) - (a.creator.matchScore ?? 0));
    }

    const enriched: PaginatedResult<BidWithCreator> = { items, pagination: result.pagination };

    if (!filters.bidIds || filters.bidIds.length === 0) {
      await this.bidCache.setBidList(campaignId, filters, enriched);
    }

    return enriched;
  }

  async shortlistBid(brandId: string, bidId: string): Promise<BidDocument> {
    const bid = await this.bidRepository.findById(bidId);
    if (!bid) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    await this.assertBrandOwnsBid(brandId, bid.campaignId.toString());

    if (bid.status !== BidStatus.Submitted) {
      throw new ValidationError("Only submitted bids can be shortlisted", "BID_NOT_ACTIONABLE");
    }

    const updated = await this.bidRepository.updateById(bidId, {
      status: BidStatus.Shortlisted,
      shortlistedAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    this.eventPublisher.publish(
      BidEvent.Shortlisted,
      {
        bidId,
        campaignId: bid.campaignId.toString(),
        creatorId: bid.creatorId.toString(),
        brandId,
      },
      BID_EXCHANGE_NAME,
    );

    await this.bidCache.invalidateBidList(bid.campaignId.toString());

    return updated;
  }

  async unshortlistBid(brandId: string, bidId: string): Promise<BidDocument> {
    const bid = await this.bidRepository.findById(bidId);
    if (!bid) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    await this.assertBrandOwnsBid(brandId, bid.campaignId.toString());

    if (bid.status !== BidStatus.Shortlisted) {
      throw new ValidationError("Only shortlisted bids can be un-shortlisted", "BID_NOT_ACTIONABLE");
    }

    const updated = await this.bidRepository.updateById(bidId, {
      status: BidStatus.Submitted,
      shortlistedAt: null,
    });
    if (!updated) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    await this.bidCache.invalidateBidList(bid.campaignId.toString());

    return updated;
  }

  async declineBid(brandId: string, bidId: string, reason?: string): Promise<BidDocument> {
    const bid = await this.bidRepository.findById(bidId);
    if (!bid) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    await this.assertBrandOwnsBid(brandId, bid.campaignId.toString());

    if (bid.status !== BidStatus.Submitted && bid.status !== BidStatus.Shortlisted) {
      throw new ValidationError("Bid cannot be declined in its current state", "BID_NOT_ACTIONABLE");
    }

    const updated = await this.bidRepository.updateById(bidId, {
      status: BidStatus.Declined,
      declineReason: reason ?? null,
      declinedAt: new Date(),
      autoDeclined: false,
    });
    if (!updated) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

    this.eventPublisher.publish(
      BidEvent.Declined,
      {
        bidId,
        campaignId: bid.campaignId.toString(),
        creatorId: bid.creatorId.toString(),
        brandId,
        declineReason: reason ?? null,
        autoDeclined: false,
      },
      BID_EXCHANGE_NAME,
    );

    await Promise.all([
      this.bidCache.invalidateBidList(bid.campaignId.toString()),
      this.bidCache.invalidateCreatorBids(bid.creatorId.toString()),
    ]);

    return updated;
  }

  async acceptBid(brandId: string, bidId: string): Promise<AcceptBidResult> {
    const bid = await this.bidRepository.findById(bidId);
    if (!bid || bid.brandId.toString() !== brandId) {
      throw new NotFoundError("Bid not found", "BID_NOT_FOUND");
    }

    const campaign = await this.campaignRepository.findById(bid.campaignId.toString());
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Bid not found", "BID_NOT_FOUND");
    }

    if (campaign.status === CampaignStatus.InProgress) {
      throw new ConflictError("A bid has already been accepted for this campaign", "CAMPAIGN_ALREADY_IN_PROGRESS");
    }

    if (campaign.status !== CampaignStatus.Active) {
      throw new ValidationError("Campaign is not active", "CAMPAIGN_NOT_ACTIVE");
    }

    if (bid.status !== BidStatus.Submitted && bid.status !== BidStatus.Shortlisted) {
      throw new ValidationError("Bid is not in an actionable state", "BID_NOT_ACTIONABLE");
    }

    const lockKey = this.bidAcceptLockKey(bid.campaignId.toString());
    const lockToken = await this.lockService.acquire(lockKey, BID_LOCK_TTL_SECONDS);

    if (!lockToken) {
      throw new ConflictError("Bid acceptance already in progress, please try again", "BID_ACCEPTANCE_IN_PROGRESS");
    }

    const session = await this.bidRepository.startSession();
    let declinedBids: Array<{ bidId: string; creatorId: string }> = [];
    let acceptedBid: BidDocument | null = null;

    try {
      session.startTransaction();

      acceptedBid = await this.bidRepository.updateStatusWithSession(
        bidId,
        BidStatus.Accepted,
        { acceptedAt: new Date() },
        session,
      );
      if (!acceptedBid) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");

      declinedBids = await this.bidRepository.bulkDecline(
        bid.campaignId.toString(),
        bidId,
        session,
      );

      await this.campaignRepository.updateStatus(
        bid.campaignId.toString(),
        CampaignStatus.InProgress,
        undefined,
        session,
      );

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      await session.endSession();
      await this.lockService.release(lockKey, lockToken);
    }

    const campaignId = bid.campaignId.toString();
    const creatorId = bid.creatorId.toString();

    this.eventPublisher.publish(
      BidEvent.Accepted,
      {
        bidId,
        campaignId,
        creatorId,
        brandId,
        agreedAmount: bid.proposedAmount,
        proposedTimeline: bid.proposedTimeline,
      },
      BID_EXCHANGE_NAME,
    );

    if (declinedBids.length > 0) {
      this.eventPublisher.publish(
        BidEvent.BulkDeclined,
        {
          campaignId,
          declinedBids,
          declinedCount: declinedBids.length,
        },
        BID_EXCHANGE_NAME,
      );
    }

    await Promise.all([
      this.bidCache.invalidateBidList(campaignId),
      this.bidCache.invalidateCreatorBids(creatorId),
      ...declinedBids.map((b) => this.bidCache.invalidateCreatorBids(b.creatorId)),
    ]);

    return {
      acceptedBid: {
        _id: acceptedBid._id.toString(),
        campaignId,
        creatorId,
        brandId,
        proposedAmount: bid.proposedAmount,
        proposedTimeline: bid.proposedTimeline,
        status: BidStatus.Accepted,
        acceptedAt: acceptedBid.acceptedAt,
      },
      declinedCount: declinedBids.length,
      campaignStatus: CampaignStatus.InProgress,
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private async assertBrandOwnsBid(brandId: string, campaignId: string): Promise<void> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Bid not found", "BID_NOT_FOUND");
    }
  }

  private bidAcceptLockKey(campaignId: string): string {
    return `lock:bid:accept:${campaignId}`;
  }

}
