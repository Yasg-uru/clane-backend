import { AuthError } from "../../core/errors/AuthError";
import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import type { BidService } from "./BidService";
import type { NotificationRepository } from "../../infrastructure/repositories/NotificationRepository";
import {
  submitBidSchema,
  withdrawBidSchema,
  declineBidSchema,
  getBidsSchema,
  getCreatorBidsSchema,
  getNotificationsSchema,
} from "./bid.validator";

const toParam = (val: string | string[] | undefined): string | undefined => {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val[0];
  return undefined;
};

export class BidController {
  constructor(
    private readonly bidService: BidService,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  // ─── Creator handlers ──────────────────────────────────────────────────────

  submitBid = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const data = submitBidSchema.parse(req.body);
    const bid = await this.bidService.submitBid(req.user.userId, data);
    res.status(201).json(new ApiResponse("Bid submitted successfully", { bid }));
  });

  getCreatorBids = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const filters = getCreatorBidsSchema.parse(req.query);
    const result = await this.bidService.getCreatorBids(req.user.userId, filters);
    res.status(200).json(new ApiResponse("Bids retrieved", result));
  });

  getCreatorBidForCampaign = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParam(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const bid = await this.bidService.getCreatorBidForCampaign(req.user.userId, campaignId);
    res.status(200).json(new ApiResponse("Bid retrieved", { bid }));
  });

  withdrawBid = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const bidId = toParam(req.params["bidId"]);
    if (!bidId) throw new AuthError("Unauthorized");
    const { withdrawReason } = withdrawBidSchema.parse(req.body);
    const bid = await this.bidService.withdrawBid(req.user.userId, bidId, withdrawReason);
    res.status(200).json(new ApiResponse("Bid withdrawn", { bid }));
  });

  // ─── Brand handlers ────────────────────────────────────────────────────────

  getBidsForCampaign = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const campaignId = toParam(req.params["campaignId"]);
    if (!campaignId) throw new AuthError("Unauthorized");
    const filters = getBidsSchema.parse(req.query);
    const result = await this.bidService.getBidsForCampaign(req.user.userId, campaignId, filters);
    res.status(200).json(new ApiResponse("Bids retrieved", result));
  });

  shortlistBid = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const bidId = toParam(req.params["bidId"]);
    if (!bidId) throw new AuthError("Unauthorized");
    const bid = await this.bidService.shortlistBid(req.user.userId, bidId);
    res.status(200).json(new ApiResponse("Bid shortlisted", { bid }));
  });

  unshortlistBid = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const bidId = toParam(req.params["bidId"]);
    if (!bidId) throw new AuthError("Unauthorized");
    const bid = await this.bidService.unshortlistBid(req.user.userId, bidId);
    res.status(200).json(new ApiResponse("Bid removed from shortlist", { bid }));
  });

  declineBid = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const bidId = toParam(req.params["bidId"]);
    if (!bidId) throw new AuthError("Unauthorized");
    const { declineReason } = declineBidSchema.parse(req.body);
    const bid = await this.bidService.declineBid(req.user.userId, bidId, declineReason);
    res.status(200).json(new ApiResponse("Bid declined", { bid }));
  });

  acceptBid = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const bidId = toParam(req.params["bidId"]);
    if (!bidId) throw new AuthError("Unauthorized");
    const result = await this.bidService.acceptBid(req.user.userId, bidId);
    res.status(200).json(new ApiResponse("Bid accepted", result));
  });

  // ─── Notification handlers ─────────────────────────────────────────────────

  getNotifications = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const { page, limit } = getNotificationsSchema.parse(req.query);
    const result = await this.notificationRepository.findByRecipient(req.user.userId, page, limit);
    res.status(200).json(new ApiResponse("Notifications retrieved", result));
  });

  getUnreadCount = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const count = await this.notificationRepository.countUnread(req.user.userId);
    res.status(200).json(new ApiResponse("Unread count retrieved", { count }));
  });

  markAsRead = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    const notificationId = toParam(req.params["notificationId"]);
    if (!notificationId) throw new AuthError("Unauthorized");
    await this.notificationRepository.markAsRead(notificationId, req.user.userId);
    res.status(200).json(new ApiResponse("Notification marked as read", {}));
  });

  markAllAsRead = AsyncHandler.wrap(async (req, res) => {
    if (!req.user) throw new AuthError("Unauthorized");
    await this.notificationRepository.markAllAsRead(req.user.userId);
    res.status(200).json(new ApiResponse("All notifications marked as read", {}));
  });
}
