import type {
  Campaign,
  CampaignWizardData,
  PaginatedCampaigns,
  BrandCampaignFilters,
} from "@/types/campaign.types";

export interface ICreateCampaignPayload
  extends Omit<CampaignWizardData, "shootingLat" | "shootingLng" | "shootingRadiusKm"> {
  deadline: string;
  shootingLocation?: {
    geo: { type: "Point"; coordinates: [number, number] };
    radiusKm?: number;
  };
}

export interface ICampaignRepository {
  createDraft(payload: ICreateCampaignPayload): Promise<Campaign>;
  getBrandCampaigns(filters: BrandCampaignFilters): Promise<PaginatedCampaigns>;
  getCampaignDetail(id: string): Promise<Campaign>;
  updateDraft(id: string, payload: Partial<ICreateCampaignPayload>): Promise<Campaign>;
  publishCampaign(id: string): Promise<Campaign>;
  unpublishCampaign(id: string): Promise<Campaign>;
  closeCampaign(id: string): Promise<Campaign>;
}
