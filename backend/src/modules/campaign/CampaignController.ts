import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { requireParam, requireUser } from "../../utils/httpContext";
import type { CampaignService } from "./CampaignService";
import {
  brandListFiltersSchema,
  browseFiltersSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from "./campaign.validator";

export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // ─── Brand handlers ────────────────────────────────────────────────────────

  createDraft = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const data = createCampaignSchema.parse(req.body);
    const campaign = await this.campaignService.createDraft(user.userId, data);
    res.status(201).json(new ApiResponse("Campaign draft created", { campaign }));
  });

  getBrandCampaigns = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const filters = brandListFiltersSchema.parse(req.query);
    const result = await this.campaignService.getBrandCampaigns(user.userId, filters);
    res.status(200).json(new ApiResponse("Campaigns retrieved", result));
  });

  getCampaignDetail = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const campaign = await this.campaignService.getCampaignDetail(user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign retrieved", { campaign }));
  });

  updateDraft = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const data = updateCampaignSchema.parse(req.body);
    const campaign = await this.campaignService.updateDraft(user.userId, campaignId, data);
    res.status(200).json(new ApiResponse("Campaign updated", { campaign }));
  });

  publishCampaign = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const campaign = await this.campaignService.publishCampaign(user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign published", { campaign }));
  });

  unpublishCampaign = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const campaign = await this.campaignService.unpublishCampaign(user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign unpublished", { campaign }));
  });

  closeCampaign = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const campaign = await this.campaignService.closeCampaign(user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign closed", { campaign }));
  });

  // ─── Creator handlers ──────────────────────────────────────────────────────

  browseCampaigns = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const filters = browseFiltersSchema.parse(req.query);
    const { page, limit, ...browseFilters } = filters;
    const result = await this.campaignService.browseCampaigns(
      user.userId,
      browseFilters,
      page,
      limit,
    );
    res.status(200).json(new ApiResponse("Campaigns retrieved", result));
  });

  getCampaignDetailForCreator = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const slug = requireParam(req, "slug");
    const result = await this.campaignService.getCampaignDetailForCreator(user.userId, slug);
    res.status(200).json(new ApiResponse("Campaign retrieved", { campaign: result }));
  });

  // ─── Public handler ────────────────────────────────────────────────────────

  getPublicCampaignPreview = AsyncHandler.wrap(async (req, res) => {
    const slug = requireParam(req, "slug");
    const preview = await this.campaignService.getPublicCampaignPreview(slug);
    res.status(200).json(new ApiResponse("Campaign preview retrieved", { campaign: preview }));
  });
}
