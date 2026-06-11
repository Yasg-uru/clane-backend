import type { CampaignDocument } from "../../models/Campaign.model";
import type { PaginatedResult } from "../../core/types";
import type { ICampaignRepository, BrowseFilters, CampaignListFilters } from "../../core/interfaces/ICampaignRepository";
import type { ICreatorCampaignMatchRepository } from "../../core/interfaces/ICreatorCampaignMatchRepository";
import type { IBrandRepository } from "../../core/interfaces/IBrandRepository";
import type { ICreatorRepository } from "../../core/interfaces/ICreatorRepository";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { MatchScorer } from "./scoring/MatchScorer";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ValidationError } from "../../core/errors/ValidationError";
import { ConflictError } from "../../core/errors/ConflictError";
import { CAMPAIGN_EXCHANGE_NAME, CampaignEvent } from "../../config/config.constants";
import { CampaignCacheManager } from "./CampaignCacheManager";
import { CampaignUtils } from "./campaign.utils";
import type {
  CampaignWithMatch,
  PublicCampaignPreview,
} from "./campaign.types";
import type { CreateCampaignInput, UpdateCampaignInput } from "./campaign.validator";
import { CampaignStatus } from "../../models/Campaign.model";

export class CampaignService {
  constructor(
    private readonly campaignRepository: ICampaignRepository,
    private readonly creatorCampaignMatchRepository: ICreatorCampaignMatchRepository,
    private readonly brandRepository: IBrandRepository,
    private readonly creatorRepository: ICreatorRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly campaignCache: CampaignCacheManager,
    private readonly matchScorer: MatchScorer,
  ) {}

  // ─── Brand-facing ──────────────────────────────────────────────────────────

  async createDraft(brandId: string, data: CreateCampaignInput): Promise<CampaignDocument> {
    const slug = CampaignUtils.generateUniqueSlug(data.title);
    return this.campaignRepository.create({
      brandId,
      slug,
      status: CampaignStatus.Draft,
      publishedAt: null,
      closedAt: null,
      totalBids: 0,
      viewCount: 0,
      ...data,
    });
  }

  async updateDraft(
    brandId: string,
    campaignId: string,
    data: UpdateCampaignInput,
  ): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status !== CampaignStatus.Draft) {
      throw new ValidationError("Campaign cannot be edited in its current state", "CAMPAIGN_NOT_EDITABLE");
    }

    const updated = await this.campaignRepository.updateById(campaignId, data);
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    await this.campaignCache.invalidateBrand(brandId);
    await this.campaignCache.invalidateDetail(campaign.slug);

    return updated;
  }

  async publishCampaign(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status === CampaignStatus.Active) {
      throw new ConflictError("Campaign is already active", "CAMPAIGN_ALREADY_ACTIVE");
    }
    if (campaign.status !== CampaignStatus.Draft) {
      throw new ValidationError("Only draft campaigns can be published", "CAMPAIGN_NOT_PUBLISHABLE");
    }
    if (!CampaignUtils.isReadyToPublish(campaign)) {
      throw new ValidationError("Campaign is missing required fields or deadline has passed", "CAMPAIGN_NOT_PUBLISHABLE");
    }

    const updated = await this.campaignRepository.updateStatus(campaignId, CampaignStatus.Active, {
      publishedAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    this.eventPublisher.publish(
      CampaignEvent.Published,
      {
        campaignId,
        brandId,
        platform: campaign.platform,
        niche: campaign.niche,
        targetLocation: campaign.targetLocation,
        budgetAmount: campaign.budgetAmount,
        deadline: campaign.deadline.toISOString(),
        deliveryType: campaign.deliveryType,
        shootingLocation: campaign.shootingLocation ?? null,
        creatorRequirements: campaign.creatorRequirements ?? null,
      },
      CAMPAIGN_EXCHANGE_NAME,
    );

    await Promise.all([
      this.campaignCache.invalidateBrand(brandId),
      this.campaignCache.invalidateBrowse(),
      this.campaignCache.invalidateDetail(campaign.slug),
    ]);

    return updated;
  }

  async unpublishCampaign(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status !== CampaignStatus.Active) {
      throw new ValidationError("Only active campaigns can be unpublished", "CAMPAIGN_NOT_EDITABLE");
    }

    const updated = await this.campaignRepository.updateStatus(campaignId, CampaignStatus.Draft);
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    this.eventPublisher.publish(
      CampaignEvent.Unpublished,
      { campaignId, brandId },
      CAMPAIGN_EXCHANGE_NAME,
    );

    await Promise.all([
      this.campaignCache.invalidateBrand(brandId),
      this.campaignCache.invalidateBrowse(),
      this.campaignCache.invalidateDetail(campaign.slug),
    ]);

    return updated;
  }

  async closeCampaign(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status === CampaignStatus.Closed) {
      throw new ValidationError("Campaign is already closed", "CAMPAIGN_NOT_EDITABLE");
    }
    if (campaign.totalBids > 0) {
      throw new ConflictError("Cannot close a campaign with existing bids", "CAMPAIGN_HAS_BIDS");
    }

    const updated = await this.campaignRepository.updateStatus(campaignId, CampaignStatus.Closed, {
      closedAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    this.eventPublisher.publish(
      CampaignEvent.Closed,
      { campaignId, brandId },
      CAMPAIGN_EXCHANGE_NAME,
    );

    await Promise.all([
      this.campaignCache.invalidateBrand(brandId),
      this.campaignCache.invalidateBrowse(),
      this.campaignCache.invalidateDetail(campaign.slug),
    ]);

    return updated;
  }

  async getBrandCampaigns(
    brandId: string,
    filters: CampaignListFilters,
  ): Promise<PaginatedResult<CampaignDocument>> {
    const page = filters.page ?? 1;
    const cached = await this.campaignCache.getBrandList(brandId, page);
    if (cached) return cached;

    const result = await this.campaignRepository.findByBrandId(brandId, filters);
    await this.campaignCache.setBrandList(brandId, page, result);
    return result;
  }

  async getCampaignDetail(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    return campaign;
  }

  // ─── Creator-facing ────────────────────────────────────────────────────────

  async browseCampaigns(
    creatorId: string,
    filters: BrowseFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<CampaignWithMatch>> {
    const cached = await this.campaignCache.getBrowse(filters, page, limit);
    if (cached) return cached;

    const result = await this.campaignRepository.findActiveWithFilters(filters, page, limit);
    const campaignIds = result.items.map((c) => c._id.toString());
    const matchScoreMap = await this.creatorCampaignMatchRepository.findMatchesForCreator(
      creatorId,
      campaignIds,
    );

    const items: CampaignWithMatch[] = result.items.map((doc) => ({
      ...(doc.toObject() as unknown as CampaignWithMatch),
      matchScore: matchScoreMap.get(doc._id.toString()),
    }));

    const enriched: PaginatedResult<CampaignWithMatch> = {
      items,
      pagination: result.pagination,
    };

    await this.campaignCache.setBrowse(filters, page, limit, enriched);
    return enriched;
  }

  async getCampaignDetailForCreator(
    creatorId: string,
    slug: string,
  ): Promise<CampaignWithMatch> {
    const cached = await this.campaignCache.getDetail(slug);

    if (cached) {
      const cachedId = (cached._id as unknown as { toString(): string }).toString();
      const matchScore = (
        await this.creatorCampaignMatchRepository.findMatchesForCreator(creatorId, [cachedId])
      ).get(cachedId);

      this.eventPublisher.publish(
        CampaignEvent.Viewed,
        { campaignId: cachedId, creatorId },
        CAMPAIGN_EXCHANGE_NAME,
      );

      return { ...cached, matchScore };
    }

    const campaign = await this.campaignRepository.findBySlug(slug);
    if (!campaign || campaign.status !== CampaignStatus.Active) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }

    const campaignId = campaign._id.toString();
    const matchScoreMap = await this.creatorCampaignMatchRepository.findMatchesForCreator(
      creatorId,
      [campaignId],
    );

    const result: CampaignWithMatch = {
      ...(campaign.toObject() as unknown as CampaignWithMatch),
      matchScore: matchScoreMap.get(campaignId),
    };

    await this.campaignCache.setDetail(slug, campaign.toObject());

    this.eventPublisher.publish(
      CampaignEvent.Viewed,
      { campaignId, creatorId },
      CAMPAIGN_EXCHANGE_NAME,
    );

    return result;
  }

  async getPublicCampaignPreview(slug: string): Promise<PublicCampaignPreview> {
    const campaign = await this.campaignRepository.findBySlug(slug);
    if (!campaign || campaign.status !== CampaignStatus.Active) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }

    const brand = await this.brandRepository.findById(campaign.brandId.toString());
    const brandName = brand?.brandName ?? brand?.fullName ?? "Unknown Brand";

    return {
      id: campaign._id.toString(),
      title: campaign.title,
      platform: campaign.platform,
      niche: campaign.niche,
      budgetAmount: campaign.budgetAmount,
      deadline: campaign.deadline,
      brandName,
    };
  }

  // ─── Internal ──────────────────────────────────────────────────────────────

  async computeMatchScoresForCampaign(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign) return;

    const creators = await this.creatorRepository.findAllActive();
    const scores = creators.map((creator) => ({
      creatorId: creator._id.toString(),
      score: this.matchScorer.compute(campaign, creator),
    }));

    await this.creatorCampaignMatchRepository.bulkUpsertMatches(campaignId, scores);
  }

  async handleExpiredCampaigns(): Promise<void> {
    const expired = await this.campaignRepository.findExpiredActiveCampaigns();

    for (const campaign of expired) {
      await this.campaignRepository.updateStatus(campaign._id.toString(), CampaignStatus.Closed, {
        closedAt: new Date(),
      });

      this.eventPublisher.publish(
        CampaignEvent.Expired,
        {
          campaignId: campaign._id.toString(),
          brandId: campaign.brandId.toString(),
          deadline: campaign.deadline.toISOString(),
        },
        CAMPAIGN_EXCHANGE_NAME,
      );

      await Promise.all([
        this.campaignCache.invalidateBrand(campaign.brandId.toString()),
        this.campaignCache.invalidateDetail(campaign.slug),
      ]);
    }

    await this.campaignCache.invalidateBrowse();
  }

}
