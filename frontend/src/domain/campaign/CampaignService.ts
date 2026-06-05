import { normalizeError } from "@/lib/api/error-handler";
import type { Campaign, BrandCampaignFilters, PaginatedCampaigns } from "@/types/campaign.types";
import type {
  CampaignBrowseDetail,
  CampaignBrowseFilters,
  PaginatedCampaignBrowse,
} from "@/types/creator.types";
import type { ICampaignRepository, ICreateCampaignPayload } from "./ICampaignRepository";

export class CampaignService {
  constructor(private readonly repo: ICampaignRepository) {}

  async createDraft(payload: ICreateCampaignPayload): Promise<Campaign> {
    try {
      return await this.repo.createDraft(payload);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getBrandCampaigns(filters: BrandCampaignFilters): Promise<PaginatedCampaigns> {
    try {
      return await this.repo.getBrandCampaigns(filters);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getCampaignDetail(id: string): Promise<Campaign> {
    try {
      return await this.repo.getCampaignDetail(id);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async updateDraft(id: string, payload: Partial<ICreateCampaignPayload>): Promise<Campaign> {
    try {
      return await this.repo.updateDraft(id, payload);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async publishCampaign(id: string): Promise<Campaign> {
    try {
      return await this.repo.publishCampaign(id);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async unpublishCampaign(id: string): Promise<Campaign> {
    try {
      return await this.repo.unpublishCampaign(id);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async closeCampaign(id: string): Promise<Campaign> {
    try {
      return await this.repo.closeCampaign(id);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async browseCampaigns(filters: CampaignBrowseFilters): Promise<PaginatedCampaignBrowse> {
    try {
      return await this.repo.browseCampaigns(filters);
    } catch (error) {
      throw normalizeError(error);
    }
  }

  async getCampaignDetailForCreator(slug: string): Promise<CampaignBrowseDetail> {
    try {
      return await this.repo.getCampaignDetailForCreator(slug);
    } catch (error) {
      throw normalizeError(error);
    }
  }
}
