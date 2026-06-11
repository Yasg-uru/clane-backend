import type { Types } from "mongoose";
import type { CampaignPlatform, CampaignStatus, ICampaign, TargetGender } from "../../models/Campaign.model";

export type { CampaignPlatform, CampaignStatus, TargetGender };

export interface CampaignWithMatch extends ICampaign {
  _id: Types.ObjectId;
  matchScore?: number;
}

export interface PublicCampaignPreview {
  id: string;
  title: string;
  platform: CampaignPlatform;
  niche: string[];
  budgetAmount: number;
  deadline: Date;
  brandName: string;
}
