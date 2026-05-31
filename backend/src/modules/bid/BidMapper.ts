import type { BidDocument } from "../../models/Bid.model";
import type { CreatorDocument } from "../../models/Creator.model";
import type { BidWithCampaign, BidWithCreator } from "./bid.types";
import { UNKNOWN_BRAND_NAME, UNKNOWN_PLATFORM } from "./bid.constants";

export interface BidCampaignContext {
  title: string;
  platform: string;
}

export class BidMapper {
  static toBidWithCampaign(
    bid: BidDocument,
    campaign: BidCampaignContext | undefined,
    brandName: string | undefined,
  ): BidWithCampaign {
    return {
      _id: bid._id.toString(),
      campaignId: bid.campaignId.toString(),
      brandId: bid.brandId.toString(),
      proposedAmount: bid.proposedAmount,
      pitch: bid.pitch,
      attachmentUrl: bid.attachmentUrl,
      proposedTimeline: bid.proposedTimeline,
      status: bid.status,
      declineReason: bid.declineReason,
      withdrawReason: bid.withdrawReason,
      autoDeclined: bid.autoDeclined,
      shortlistedAt: bid.shortlistedAt,
      acceptedAt: bid.acceptedAt,
      declinedAt: bid.declinedAt,
      withdrawnAt: bid.withdrawnAt,
      campaignBudgetAtBid: bid.campaignBudgetAtBid,
      campaignDeadlineAtBid: bid.campaignDeadlineAtBid,
      campaignTitleAtBid: bid.campaignTitleAtBid,
      createdAt: bid.createdAt ?? new Date(),
      updatedAt: bid.updatedAt ?? new Date(),
      campaignTitle: campaign?.title ?? bid.campaignTitleAtBid,
      campaignPlatform: campaign?.platform ?? UNKNOWN_PLATFORM,
      brandName: brandName ?? UNKNOWN_BRAND_NAME,
    };
  }

  static toBidWithCreator(
    bid: BidDocument,
    creator: CreatorDocument | undefined,
    matchScore: number | undefined,
  ): BidWithCreator {
    return {
      _id: bid._id.toString(),
      campaignId: bid.campaignId.toString(),
      brandId: bid.brandId.toString(),
      proposedAmount: bid.proposedAmount,
      pitch: bid.pitch,
      attachmentUrl: bid.attachmentUrl,
      proposedTimeline: bid.proposedTimeline,
      status: bid.status,
      declineReason: bid.declineReason,
      autoDeclined: bid.autoDeclined,
      shortlistedAt: bid.shortlistedAt,
      acceptedAt: bid.acceptedAt,
      declinedAt: bid.declinedAt,
      campaignBudgetAtBid: bid.campaignBudgetAtBid,
      campaignDeadlineAtBid: bid.campaignDeadlineAtBid,
      campaignTitleAtBid: bid.campaignTitleAtBid,
      createdAt: bid.createdAt ?? new Date(),
      updatedAt: bid.updatedAt ?? new Date(),
      creator: {
        id: creator?._id.toString() ?? bid.creatorId.toString(),
        fullName: creator?.fullName ?? "",
        instagramHandle: creator?.instagramHandle ?? "",
        instagramFollowers: creator?.instagramFollowers ?? 0,
        niche: creator?.niche ?? [],
        city: creator?.city ?? "",
        instagramProfilePicUrl: creator?.instagramProfilePicUrl,
        matchScore,
      },
    };
  }
}
