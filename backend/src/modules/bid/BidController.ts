import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { requireParam, requireUser } from "../../utils/httpContext";
import type { BidService } from "./BidService";
import {
  submitBidSchema,
  withdrawBidSchema,
  declineBidSchema,
  getBidsSchema,
  getCreatorBidsSchema,
} from "./bid.validator";

export class BidController {
  constructor(private readonly bidService: BidService) {}

  // ─── Creator handlers ──────────────────────────────────────────────────────

  submitBid = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const data = submitBidSchema.parse(req.body);
    const bid = await this.bidService.submitBid(user.userId, data);
    res.status(201).json(new ApiResponse("Bid submitted successfully", { bid }));
  });

  getCreatorBids = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const filters = getCreatorBidsSchema.parse(req.query);
    const result = await this.bidService.getCreatorBids(user.userId, filters);
    res.status(200).json(new ApiResponse("Bids retrieved", result));
  });

  getCreatorBidForCampaign = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const bid = await this.bidService.getCreatorBidForCampaign(user.userId, campaignId);
    res.status(200).json(new ApiResponse("Bid retrieved", { bid }));
  });

  withdrawBid = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const bidId = requireParam(req, "bidId");
    const { withdrawReason } = withdrawBidSchema.parse(req.body);
    const bid = await this.bidService.withdrawBid(user.userId, bidId, withdrawReason);
    res.status(200).json(new ApiResponse("Bid withdrawn", { bid }));
  });

  // ─── Brand handlers ────────────────────────────────────────────────────────

  getBidsForCampaign = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const campaignId = requireParam(req, "campaignId");
    const filters = getBidsSchema.parse(req.query);
    const result = await this.bidService.getBidsForCampaign(user.userId, campaignId, filters);
    res.status(200).json(new ApiResponse("Bids retrieved", result));
  });

  shortlistBid = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const bidId = requireParam(req, "bidId");
    const bid = await this.bidService.shortlistBid(user.userId, bidId);
    res.status(200).json(new ApiResponse("Bid shortlisted", { bid }));
  });

  unshortlistBid = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const bidId = requireParam(req, "bidId");
    const bid = await this.bidService.unshortlistBid(user.userId, bidId);
    res.status(200).json(new ApiResponse("Bid removed from shortlist", { bid }));
  });

  declineBid = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const bidId = requireParam(req, "bidId");
    const { declineReason } = declineBidSchema.parse(req.body);
    const bid = await this.bidService.declineBid(user.userId, bidId, declineReason);
    res.status(200).json(new ApiResponse("Bid declined", { bid }));
  });

  acceptBid = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const bidId = requireParam(req, "bidId");
    const result = await this.bidService.acceptBid(user.userId, bidId);
    res.status(200).json(new ApiResponse("Bid accepted", result));
  });
}
