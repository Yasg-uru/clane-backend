import type { BidStatus } from "../../models/Bid.model";
import type { CampaignStatus } from "../../models/Campaign.model";

export interface BidCreatorProfile {
  id: string;
  fullName: string;
  instagramHandle: string;
  instagramFollowers: number;
  niche: string[];
  city: string;
  instagramProfilePicUrl?: string;
  matchScore?: number;
}

export interface BidWithCreator {
  _id: string;
  campaignId: string;
  brandId: string;
  proposedAmount: number;
  pitch: string;
  attachmentUrl: string | null;
  proposedTimeline: number;
  status: BidStatus;
  declineReason: string | null;
  autoDeclined: boolean;
  shortlistedAt: Date | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  campaignBudgetAtBid: number;
  campaignDeadlineAtBid: Date;
  campaignTitleAtBid: string;
  createdAt: Date;
  updatedAt: Date;
  creator: BidCreatorProfile;
}

export interface BidWithCampaign {
  _id: string;
  campaignId: string;
  brandId: string;
  proposedAmount: number;
  pitch: string;
  attachmentUrl: string | null;
  proposedTimeline: number;
  status: BidStatus;
  declineReason: string | null;
  withdrawReason: string | null;
  autoDeclined: boolean;
  shortlistedAt: Date | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  withdrawnAt: Date | null;
  campaignBudgetAtBid: number;
  campaignDeadlineAtBid: Date;
  campaignTitleAtBid: string;
  createdAt: Date;
  updatedAt: Date;
  campaignTitle: string;
  campaignPlatform: string;
  brandName: string;
}

export interface AcceptBidResult {
  acceptedBid: {
    _id: string;
    campaignId: string;
    creatorId: string;
    brandId: string;
    proposedAmount: number;
    proposedTimeline: number;
    status: BidStatus;
    acceptedAt: Date | null;
  };
  declinedCount: number;
  campaignStatus: CampaignStatus.InProgress;
}
