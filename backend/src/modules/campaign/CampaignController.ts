import { AuthError } from "../../core/errors/AuthError";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import type { CampaignService } from "./CampaignService";
import {
  brandListFiltersSchema,
  browseFiltersSchema,
  createCampaignSchema,
  updateCampaignSchema,
} from "./campaign.validator";

const toParamString = (val: string | string[] | undefined): string | undefined => {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0];
  return undefined;
};

export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  // ─── Brand handlers ────────────────────────────────────────────────────────

  createDraft = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const data = createCampaignSchema.parse(req.body);
    const campaign = await this.campaignService.createDraft(req.user.userId, data);
    res.status(201).json(new ApiResponse("Campaign draft created", { campaign }));
  });

  getBrandCampaigns = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const filters = brandListFiltersSchema.parse(req.query);
    const result = await this.campaignService.getBrandCampaigns(req.user.userId, filters);
    res.status(200).json(new ApiResponse("Campaigns retrieved", result));
  });

  getCampaignDetail = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParamString(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const campaign = await this.campaignService.getCampaignDetail(req.user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign retrieved", { campaign }));
  });

  updateDraft = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParamString(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const data = updateCampaignSchema.parse(req.body);
    const campaign = await this.campaignService.updateDraft(req.user.userId, campaignId, data);
    res.status(200).json(new ApiResponse("Campaign updated", { campaign }));
  });

  publishCampaign = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParamString(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const campaign = await this.campaignService.publishCampaign(req.user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign published", { campaign }));
  });

  unpublishCampaign = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParamString(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const campaign = await this.campaignService.unpublishCampaign(req.user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign unpublished", { campaign }));
  });

  closeCampaign = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParamString(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const campaign = await this.campaignService.closeCampaign(req.user.userId, campaignId);
    res.status(200).json(new ApiResponse("Campaign closed", { campaign }));
  });

  // ─── Creator handlers ──────────────────────────────────────────────────────

  browseCampaigns = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const filters = browseFiltersSchema.parse(req.query);
    const { page, limit, ...browseFilters } = filters;
    const result = await this.campaignService.browseCampaigns(
      req.user.userId,
      browseFilters,
      page,
      limit,
    );
    res.status(200).json(new ApiResponse("Campaigns retrieved", result));
  });

  getCampaignDetailForCreator = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const slug = toParamString(req.params["slug"]);
    if (!slug) throw new AuthError("Unauthorized");
    const result = await this.campaignService.getCampaignDetailForCreator(req.user.userId, slug);
    res.status(200).json(new ApiResponse("Campaign retrieved", { campaign: result }));
  });

  // ─── Public handler ────────────────────────────────────────────────────────

  getPublicCampaignPreview = AsyncHandler.wrap(async (req, res) => {
    const slug = toParamString(req.params["slug"]);
    if (!slug) throw new AuthError("Unauthorized");
    const preview = await this.campaignService.getPublicCampaignPreview(slug);
    res.status(200).json(new ApiResponse("Campaign preview retrieved", { campaign: preview }));
  });
}
