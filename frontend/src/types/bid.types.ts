export const BidStatus = {
  SUBMITTED: "submitted",
  SHORTLISTED: "shortlisted",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  WITHDRAWN: "withdrawn",
} as const;
export type BidStatus = (typeof BidStatus)[keyof typeof BidStatus];

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
  shortlistedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  campaignBudgetAtBid: number;
  campaignDeadlineAtBid: string;
  campaignTitleAtBid: string;
  createdAt: string;
  updatedAt: string;
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
  shortlistedAt: string | null;
  acceptedAt: string | null;
  declinedAt: string | null;
  withdrawnAt: string | null;
  campaignBudgetAtBid: number;
  campaignDeadlineAtBid: string;
  campaignTitleAtBid: string;
  createdAt: string;
  updatedAt: string;
  campaignTitle: string;
  campaignPlatform: string;
  brandName: string;
}

export interface PaginatedBidsWithCreator {
  items: BidWithCreator[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedBidsWithCampaign {
  items: BidWithCampaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubmitBidPayload {
  campaignId: string;
  proposedAmount: number;
  pitch: string;
  proposedTimeline: number;
  attachmentUrl?: string;
}

export interface CreatorBidFilters {
  page?: number;
  limit?: number;
}
