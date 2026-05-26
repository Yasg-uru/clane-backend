import crypto from "crypto";
import type { CampaignDocument } from "../../models/Campaign.model";
import type { PaginatedResult } from "../../core/types";
import type { CampaignRepository, BrowseFilters, CampaignListFilters } from "../../infrastructure/repositories/CampaignRepository";
import type { CreatorCampaignMatchRepository } from "../../infrastructure/repositories/CreatorCampaignMatchRepository";
import type { BrandRepository } from "../../infrastructure/repositories/BrandRepository";
import type { CreatorRepository } from "../../infrastructure/repositories/CreatorRepository";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { ICacheService } from "../../core/interfaces/ICacheService";
import type { MatchScorer } from "./scoring/MatchScorer";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ValidationError } from "../../core/errors/ValidationError";
import { ConflictError } from "../../core/errors/ConflictError";
import { CAMPAIGN_EXCHANGE_NAME } from "../../config/config.constants";
import {
  BROWSE_CACHE_TTL,
  BRAND_CAMPAIGN_CACHE_TTL,
  DETAIL_CACHE_TTL,
  SLUG_SUFFIX_BYTES,
  MIN_DEADLINE_MS,
} from "./campaign.constants";
import type {
  CampaignWithMatch,
  PublicCampaignPreview,
} from "./campaign.types";
import type { CreateCampaignInput, UpdateCampaignInput } from "./campaign.validator";

export class CampaignService {
  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly creatorCampaignMatchRepository: CreatorCampaignMatchRepository,
    private readonly brandRepository: BrandRepository,
    private readonly creatorRepository: CreatorRepository,
    private readonly eventPublisher: IEventPublisher,
    private readonly cacheService: ICacheService,
    private readonly matchScorer: MatchScorer,
  ) {}

  // ─── Brand-facing ──────────────────────────────────────────────────────────

  async createDraft(brandId: string, data: CreateCampaignInput): Promise<CampaignDocument> {
    const slug = this.generateUniqueSlug(data.title);
    return this.campaignRepository.create({
      brandId,
      slug,
      status: "draft",
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
    if (campaign.status !== "draft") {
      throw new ValidationError("Campaign cannot be edited in its current state", "CAMPAIGN_NOT_EDITABLE");
    }

    const updated = await this.campaignRepository.updateById(campaignId, data);
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    await this.invalidateBrandCache(brandId);
    await this.cacheService.del(this.detailCacheKey(campaign.slug));

    return updated;
  }

  async publishCampaign(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status === "active") {
      throw new ConflictError("Campaign is already active", "CAMPAIGN_ALREADY_ACTIVE");
    }
    if (campaign.status !== "draft") {
      throw new ValidationError("Only draft campaigns can be published", "CAMPAIGN_NOT_PUBLISHABLE");
    }
    if (!this.isReadyToPublish(campaign)) {
      throw new ValidationError("Campaign is missing required fields or deadline has passed", "CAMPAIGN_NOT_PUBLISHABLE");
    }

    const updated = await this.campaignRepository.updateStatus(campaignId, "active", {
      publishedAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    this.eventPublisher.publish(
      "campaign.published",
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
      this.invalidateBrandCache(brandId),
      this.invalidateBrowseCache(),
      this.cacheService.del(this.detailCacheKey(campaign.slug)),
    ]);

    return updated;
  }

  async unpublishCampaign(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status !== "active") {
      throw new ValidationError("Only active campaigns can be unpublished", "CAMPAIGN_NOT_EDITABLE");
    }

    const updated = await this.campaignRepository.updateStatus(campaignId, "draft");
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    this.eventPublisher.publish(
      "campaign.unpublished",
      { campaignId, brandId },
      CAMPAIGN_EXCHANGE_NAME,
    );

    await Promise.all([
      this.invalidateBrandCache(brandId),
      this.invalidateBrowseCache(),
      this.cacheService.del(this.detailCacheKey(campaign.slug)),
    ]);

    return updated;
  }

  async closeCampaign(brandId: string, campaignId: string): Promise<CampaignDocument> {
    const campaign = await this.campaignRepository.findById(campaignId);
    if (!campaign || campaign.brandId.toString() !== brandId) {
      throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");
    }
    if (campaign.status === "closed") {
      throw new ValidationError("Campaign is already closed", "CAMPAIGN_NOT_EDITABLE");
    }
    if (campaign.totalBids > 0) {
      throw new ConflictError("Cannot close a campaign with existing bids", "CAMPAIGN_HAS_BIDS");
    }

    const updated = await this.campaignRepository.updateStatus(campaignId, "closed", {
      closedAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    this.eventPublisher.publish(
      "campaign.closed",
      { campaignId, brandId },
      CAMPAIGN_EXCHANGE_NAME,
    );

    await Promise.all([
      this.invalidateBrandCache(brandId),
      this.invalidateBrowseCache(),
      this.cacheService.del(this.detailCacheKey(campaign.slug)),
    ]);

    return updated;
  }

  async getBrandCampaigns(
    brandId: string,
    filters: CampaignListFilters,
  ): Promise<PaginatedResult<CampaignDocument>> {
    const page = filters.page ?? 1;
    const _limit = filters.limit ?? 20;
    const cacheKey = this.brandCacheKey(brandId, page);

    const cached = await this.cacheService.get<PaginatedResult<CampaignDocument>>(cacheKey);
    if (cached) return cached;

    const result = await this.campaignRepository.findByBrandId(brandId, filters);
    await this.cacheService.set(cacheKey, result, BRAND_CAMPAIGN_CACHE_TTL);
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
    const cacheKey = this.browseCacheKey(filters, page, limit);
    const cached = await this.cacheService.get<PaginatedResult<CampaignWithMatch>>(cacheKey);
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

    await this.cacheService.set(cacheKey, enriched, BROWSE_CACHE_TTL);
    return enriched;
  }

  async getCampaignDetailForCreator(
    creatorId: string,
    slug: string,
  ): Promise<CampaignWithMatch> {
    const cacheKey = this.detailCacheKey(slug);
    const cached = await this.cacheService.get<CampaignWithMatch>(cacheKey);

    let campaign: CampaignDocument | null = null;

    if (cached) {
      const matchScore = (
        await this.creatorCampaignMatchRepository.findMatchesForCreator(creatorId, [
          (cached._id as unknown as { toString(): string }).toString(),
        ])
      ).get((cached._id as unknown as { toString(): string }).toString());

      this.eventPublisher.publish(
        "campaign.viewed",
        { campaignId: (cached._id as unknown as { toString(): string }).toString(), creatorId },
        CAMPAIGN_EXCHANGE_NAME,
      );

      return { ...cached, matchScore };
    }

    campaign = await this.campaignRepository.findBySlug(slug);
    if (!campaign || campaign.status !== "active") {
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

    await this.cacheService.set(this.detailCacheKey(slug), campaign.toObject(), DETAIL_CACHE_TTL);

    this.eventPublisher.publish(
      "campaign.viewed",
      { campaignId, creatorId },
      CAMPAIGN_EXCHANGE_NAME,
    );

    return result;
  }

  async getPublicCampaignPreview(slug: string): Promise<PublicCampaignPreview> {
    const campaign = await this.campaignRepository.findBySlug(slug);
    if (!campaign || campaign.status !== "active") {
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
      await this.campaignRepository.updateStatus(campaign._id.toString(), "closed", {
        closedAt: new Date(),
      });

      this.eventPublisher.publish(
        "campaign.expired",
        {
          campaignId: campaign._id.toString(),
          brandId: campaign.brandId.toString(),
          deadline: campaign.deadline.toISOString(),
        },
        CAMPAIGN_EXCHANGE_NAME,
      );

      await Promise.all([
        this.invalidateBrandCache(campaign.brandId.toString()),
        this.cacheService.del(this.detailCacheKey(campaign.slug)),
      ]);
    }

    await this.invalidateBrowseCache();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  private isReadyToPublish(campaign: CampaignDocument): boolean {
    const shootingLocationValid =
      campaign.deliveryType !== "onsite" || !!campaign.shootingLocation;

    return (
      !!campaign.title &&
      !!campaign.platform &&
      campaign.niche.length > 0 &&
      !!campaign.targetLocation &&
      !!campaign.targetGender &&
      !!campaign.contentBrief &&
      !!campaign.deadline &&
      campaign.deadline >= new Date(Date.now() + MIN_DEADLINE_MS) &&
      campaign.budgetAmount > 0 &&
      !!campaign.revisionRounds &&
      !!campaign.deliveryType &&
      shootingLocationValid
    );
  }

  private generateUniqueSlug(title: string): string {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    // Timestamp (base36) + 4 random bytes (hex) = guaranteed unique + SEO-friendly
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(SLUG_SUFFIX_BYTES).toString("hex");
    return `${base}-${timestamp}-${random}`;
  }

  private browseCacheKey(filters: BrowseFilters, page: number, limit: number): string {
    const params = { ...filters, page, limit };
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(params, Object.keys(params).sort()))
      .digest("hex")
      .slice(0, 16);
    return `cache:campaigns:browse:${hash}`;
  }

  private brandCacheKey(brandId: string, page: number): string {
    return `cache:campaigns:brand:${brandId}:${page}`;
  }

  private detailCacheKey(slug: string): string {
    return `cache:campaign:detail:${slug}`;
  }

  private async invalidateBrandCache(brandId: string): Promise<void> {
    await this.cacheService.delByPattern(`cache:campaigns:brand:${brandId}:*`);
  }

  private async invalidateBrowseCache(): Promise<void> {
    await this.cacheService.delByPattern("cache:campaigns:browse:*");
  }
}
