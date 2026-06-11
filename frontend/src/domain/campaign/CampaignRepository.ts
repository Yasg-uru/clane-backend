import { apiClient } from "@/lib/api/client";
import { CAMPAIGN_ENDPOINTS } from "@/lib/api/endpoints";
import type { ApiResponse } from "@/types";
import type { Campaign, PaginatedCampaigns, BrandCampaignFilters } from "@/types/campaign.types";
import type {
  CampaignBrowseDetail,
  CampaignBrowseFilters,
  PaginatedCampaignBrowse,
} from "@/types/creator.types";
import type { ICampaignRepository, ICreateCampaignPayload } from "./ICampaignRepository";

export class CampaignRepository implements ICampaignRepository {
  async createDraft(payload: ICreateCampaignPayload): Promise<Campaign> {
    const response = await apiClient.post<ApiResponse<{ campaign: Campaign }>>(
      CAMPAIGN_ENDPOINTS.create,
      payload,
    );
    return response.data.data.campaign;
  }

  async getBrandCampaigns(filters: BrandCampaignFilters): Promise<PaginatedCampaigns> {
    const response = await apiClient.get<ApiResponse<PaginatedCampaigns>>(
      CAMPAIGN_ENDPOINTS.list,
      { params: filters },
    );
    return response.data.data;
  }

  async getCampaignDetail(id: string): Promise<Campaign> {
    const response = await apiClient.get<ApiResponse<{ campaign: Campaign }>>(
      CAMPAIGN_ENDPOINTS.detail(id),
    );
    return response.data.data.campaign;
  }

  async updateDraft(id: string, payload: Partial<ICreateCampaignPayload>): Promise<Campaign> {
    const response = await apiClient.patch<ApiResponse<{ campaign: Campaign }>>(
      CAMPAIGN_ENDPOINTS.update(id),
      payload,
    );
    return response.data.data.campaign;
  }

  async publishCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post<ApiResponse<{ campaign: Campaign }>>(
      CAMPAIGN_ENDPOINTS.publish(id),
    );
    return response.data.data.campaign;
  }

  async unpublishCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post<ApiResponse<{ campaign: Campaign }>>(
      CAMPAIGN_ENDPOINTS.unpublish(id),
    );
    return response.data.data.campaign;
  }

  async closeCampaign(id: string): Promise<Campaign> {
    const response = await apiClient.post<ApiResponse<{ campaign: Campaign }>>(
      CAMPAIGN_ENDPOINTS.close(id),
    );
    return response.data.data.campaign;
  }

  async browseCampaigns(filters: CampaignBrowseFilters): Promise<PaginatedCampaignBrowse> {
    const response = await apiClient.get<ApiResponse<PaginatedCampaignBrowse>>(
      CAMPAIGN_ENDPOINTS.browse,
      { params: filters },
    );
    return response.data.data;
  }

  async getCampaignDetailForCreator(slug: string): Promise<CampaignBrowseDetail> {
    const response = await apiClient.get<ApiResponse<{ campaign: CampaignBrowseDetail }>>(
      CAMPAIGN_ENDPOINTS.browseDetail(slug),
    );
    return response.data.data.campaign;
  }
}
