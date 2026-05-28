import type { ClientSession } from "mongoose";
import type { EscrowDocument } from "../../models/Escrow.model";
import type { CollabRoomDocument } from "../../models/CollabRoom.model";
import type { BidDocument } from "../../models/Bid.model";
import type { PaginatedResult } from "../../core/types";
import type { EscrowRepository } from "../../infrastructure/repositories/EscrowRepository";
import type { CollabRoomRepository } from "../../infrastructure/repositories/CollabRoomRepository";
import type { BidRepository } from "../../infrastructure/repositories/BidRepository";
import type { CampaignRepository } from "../../infrastructure/repositories/CampaignRepository";
import type { NotificationRepository } from "../../infrastructure/repositories/NotificationRepository";
import type { RazorpayService } from "../../infrastructure/services/RazorpayService";
import type { IEventPublisher } from "../../core/interfaces/IEventPublisher";
import type { ILockService } from "../../core/interfaces/ILockService";
import type { ICacheService } from "../../core/interfaces/ICacheService";
import { NotFoundError } from "../../core/errors/NotFoundError";
import { ValidationError } from "../../core/errors/ValidationError";
import { ConflictError } from "../../core/errors/ConflictError";
import { AuthError } from "../../core/errors/AuthError";
import { env } from "../../config/env";
import { ESCROW_EXCHANGE_NAME } from "../../config/config.constants";
import { logger } from "../../utils/logger";
import { UserRole } from "../../core/types";
import { EscrowStatus } from "../../models/Escrow.model";
import { BidStatus } from "../../models/Bid.model";
import { CampaignStatus } from "../../models/Campaign.model";
import { CollabRoomStatus } from "../../models/CollabRoom.model";
import {
  PLATFORM_FEE_RATIO,
  PAISE_PER_RUPEE,
  COLLAB_DEADLINE_BUFFER_DAYS,
  WEBHOOK_LOCK_TTL_SECONDS,
} from "./escrow.constants";
import type {
  EscrowBrandView,
  EscrowCreatorView,
  CollabRoomView,
} from "./escrow.types";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_DAY = 24 * MS_PER_HOUR;

interface WebhookPaymentEntity {
  id: string;
  order_id: string;
  status: string;
  amount: number;
}

interface WebhookPayload {
  event: string;
  payload: {
    payment: { entity: WebhookPaymentEntity };
  };
}

export class EscrowService {
  constructor(
    private readonly escrowRepository: EscrowRepository,
    private readonly collabRoomRepository: CollabRoomRepository,
    private readonly bidRepository: BidRepository,
    private readonly campaignRepository: CampaignRepository,
    private readonly razorpayService: RazorpayService,
    private readonly eventPublisher: IEventPublisher,
    private readonly notificationRepository: NotificationRepository,
    private readonly lockService: ILockService,
    private readonly _cacheService: ICacheService,
  ) {
    void this._cacheService;
  }

  // ─── Worker-only ──────────────────────────────────────────────────────────

  async initEscrow(bidId: string): Promise<EscrowDocument> {
    const existing = await this.escrowRepository.findByBidId(bidId);
    if (existing) return existing;

    const bid = await this.bidRepository.findById(bidId);
    if (!bid) throw new NotFoundError("Bid not found", "BID_NOT_FOUND");
    if (bid.status !== BidStatus.Accepted) {
      throw new ValidationError("Bid is not in accepted state", "BID_NOT_ACCEPTED");
    }

    const campaign = await this.campaignRepository.findById(bid.campaignId.toString());
    if (!campaign) throw new NotFoundError("Campaign not found", "CAMPAIGN_NOT_FOUND");

    const { agreedAmount, platformFeeAmount, totalChargedAmount, creatorReceivableAmount } =
      this.calculateAmounts(bid.proposedAmount);

    const now = new Date();
    const paymentDeadline = new Date(now.getTime() + env.PAYMENT_TIMEOUT_HOURS * MS_PER_HOUR);
    const collabDeadline = new Date(
      now.getTime() + (bid.proposedTimeline + COLLAB_DEADLINE_BUFFER_DAYS) * MS_PER_DAY,
    );

    const order = await this.razorpayService.createOrder({
      amount: totalChargedAmount,
      currency: "INR",
      receipt: bid._id.toString(),
      notes: {
        bidId: bid._id.toString(),
        campaignId: bid.campaignId.toString(),
        brandId: bid.brandId.toString(),
        creatorId: bid.creatorId.toString(),
        platformFee: platformFeeAmount,
      },
    });

    const escrow = await this.escrowRepository.create({
      bidId: bid._id,
      campaignId: bid.campaignId,
      brandId: bid.brandId,
      creatorId: bid.creatorId,
      agreedAmount,
      platformFeeAmount,
      totalChargedAmount,
      creatorReceivableAmount,
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      razorpayRefundId: null,
      status: EscrowStatus.AwaitingPayment,
      paymentInitiatedAt: now,
      paymentDeadline,
      collabDeadline,
      webhookEvents: [],
    });

    await this.notificationRepository.createNotification({
      recipientId: bid.brandId.toString(),
      recipientRole: UserRole.Brand,
      type: "escrow.payment_required",
      title: "Complete your payment",
      body: `Your bid acceptance for ${bid.campaignTitleAtBid} requires payment of ₹${(totalChargedAmount / PAISE_PER_RUPEE).toLocaleString("en-IN")}. Complete payment to begin collaboration.`,
      meta: {
        escrowId: escrow._id.toString(),
        bidId: bid._id.toString(),
        campaignId: bid.campaignId.toString(),
        razorpayOrderId: order.id,
        razorpayKeyId: env.RAZORPAY_KEY_ID,
        paymentUrl: `${env.FRONTEND_PAYMENT_URL}/${escrow._id.toString()}`,
        amount: totalChargedAmount,
        paymentDeadline,
      },
    });

    this.eventPublisher.publish(
      "escrow.initiated",
      {
        escrowId: escrow._id.toString(),
        bidId: bid._id.toString(),
        campaignId: bid.campaignId.toString(),
        brandId: bid.brandId.toString(),
        creatorId: bid.creatorId.toString(),
        totalChargedAmount,
        razorpayOrderId: order.id,
        paymentDeadline,
      },
      ESCROW_EXCHANGE_NAME,
    );

    return escrow;
  }

  // ─── Webhook handler ──────────────────────────────────────────────────────

  async handlePaymentWebhook(rawBody: string, signature: string): Promise<void> {
    if (!this.razorpayService.verifyWebhookSignature(rawBody, signature)) {
      logger.warn("EscrowService: webhook signature verification failed", {
        signaturePreview: signature.slice(0, 8),
      });
      throw new AuthError("Invalid webhook signature", "INVALID_WEBHOOK_SIGNATURE");
    }

    let parsed: WebhookPayload;
    try {
      parsed = JSON.parse(rawBody) as WebhookPayload;
    } catch {
      logger.warn("EscrowService: webhook body parse failed");
      return;
    }

    if (parsed.event === "payment.captured") {
      await this.onPaymentCaptured(parsed);
      return;
    }

    if (parsed.event === "payment.failed") {
      await this.onPaymentFailed(parsed);
      return;
    }
  }

  // ─── Brand/creator-facing reads ──────────────────────────────────────────

  async getEscrowForBrand(brandId: string, escrowId: string): Promise<EscrowBrandView> {
    const escrow = await this.escrowRepository.findById(escrowId);
    if (!escrow || escrow.brandId.toString() !== brandId) {
      throw new NotFoundError("Escrow not found", "ESCROW_NOT_FOUND");
    }
    return this.toBrandView(escrow);
  }

  async getEscrowForCreator(creatorId: string, escrowId: string): Promise<EscrowCreatorView> {
    const escrow = await this.escrowRepository.findById(escrowId);
    if (!escrow || escrow.creatorId.toString() !== creatorId) {
      throw new NotFoundError("Escrow not found", "ESCROW_NOT_FOUND");
    }
    return this.toCreatorView(escrow);
  }

  async getBrandEscrows(
    brandId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<EscrowBrandView>> {
    const result = await this.escrowRepository.findByBrandId(brandId, page, limit);
    return {
      items: result.items.map((e) => this.toBrandView(e)),
      pagination: result.pagination,
    };
  }

  async getCreatorEscrows(
    creatorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<EscrowCreatorView>> {
    const result = await this.escrowRepository.findByCreatorId(creatorId, page, limit);
    return {
      items: result.items.map((e) => this.toCreatorView(e)),
      pagination: result.pagination,
    };
  }

  // ─── Brand actions ─────────────────────────────────────────────────────────

  async cancelEscrow(brandId: string, escrowId: string): Promise<EscrowBrandView> {
    const escrow = await this.escrowRepository.findById(escrowId);
    if (!escrow || escrow.brandId.toString() !== brandId) {
      throw new NotFoundError("Escrow not found", "ESCROW_NOT_FOUND");
    }
    if (escrow.status !== EscrowStatus.AwaitingPayment) {
      throw new ValidationError(
        "Escrow cannot be cancelled in its current state",
        "ESCROW_NOT_CANCELLABLE",
      );
    }

    const updated = await this.escrowRepository.updateById(escrowId, {
      status: EscrowStatus.Cancelled,
      cancelledAt: new Date(),
    });
    if (!updated) throw new NotFoundError("Escrow not found", "ESCROW_NOT_FOUND");

    this.eventPublisher.publish(
      "escrow.cancelled",
      {
        escrowId,
        bidId: escrow.bidId.toString(),
        campaignId: escrow.campaignId.toString(),
        brandId,
        reason: "brand_cancelled",
      },
      ESCROW_EXCHANGE_NAME,
    );

    return this.toBrandView(updated);
  }

  async refreshPaymentLink(brandId: string, escrowId: string): Promise<string> {
    const escrow = await this.escrowRepository.findById(escrowId);
    if (!escrow || escrow.brandId.toString() !== brandId) {
      throw new NotFoundError("Escrow not found", "ESCROW_NOT_FOUND");
    }
    if (escrow.status === EscrowStatus.Funded) {
      throw new ConflictError("Escrow is already funded", "ESCROW_ALREADY_FUNDED");
    }
    if (escrow.status !== EscrowStatus.AwaitingPayment) {
      throw new ValidationError(
        "Escrow cannot generate a new payment link",
        "ESCROW_NOT_CANCELLABLE",
      );
    }

    const order = await this.razorpayService.createOrder({
      amount: escrow.totalChargedAmount,
      currency: "INR",
      receipt: escrow._id.toString(),
      notes: {
        bidId: escrow.bidId.toString(),
        campaignId: escrow.campaignId.toString(),
        brandId: escrow.brandId.toString(),
        creatorId: escrow.creatorId.toString(),
        platformFee: escrow.platformFeeAmount,
      },
    });

    const now = new Date();
    const paymentDeadline = new Date(now.getTime() + env.PAYMENT_TIMEOUT_HOURS * MS_PER_HOUR);

    await this.escrowRepository.updateById(escrowId, {
      razorpayOrderId: order.id,
      paymentInitiatedAt: now,
      paymentDeadline,
    });

    return order.id;
  }

  // ─── Auto-refund stub (Phase 6 fills in) ──────────────────────────────────

  async initiateAutoRefund(escrowId: string): Promise<void> {
    const escrow = await this.escrowRepository.findById(escrowId);
    if (!escrow) {
      logger.warn("initiateAutoRefund: escrow not found", { escrowId });
      return;
    }
    logger.info("initiateAutoRefund: refund initiation queued", {
      escrowId,
      bidId: escrow.bidId.toString(),
    });

    this.eventPublisher.publish(
      "escrow.refund_initiated",
      {
        escrowId,
        bidId: escrow.bidId.toString(),
        campaignId: escrow.campaignId.toString(),
        brandId: escrow.brandId.toString(),
        creatorId: escrow.creatorId.toString(),
        amount: escrow.totalChargedAmount,
        reason: "collab_expired",
      },
      ESCROW_EXCHANGE_NAME,
    );
  }

  // ─── CollabRoom creation (worker-only) ────────────────────────────────────

  async createCollabRoom(escrowId: string): Promise<CollabRoomDocument> {
    const existing = await this.collabRoomRepository.findByEscrowId(escrowId);
    if (existing) return existing;

    const escrow = await this.escrowRepository.findById(escrowId);
    if (!escrow) throw new NotFoundError("Escrow not found", "ESCROW_NOT_FOUND");
    if (escrow.status !== EscrowStatus.Funded) {
      throw new ValidationError("Escrow is not funded", "ESCROW_NOT_FUNDED");
    }

    const campaign = await this.campaignRepository.findById(escrow.campaignId.toString());
    const maxRevisions = campaign?.revisionRounds ?? 1;

    return this.collabRoomRepository.create({
      escrowId: escrow._id,
      bidId: escrow.bidId,
      campaignId: escrow.campaignId,
      brandId: escrow.brandId,
      creatorId: escrow.creatorId,
      status: CollabRoomStatus.PendingChat,
      maxRevisions,
      revisionCount: 0,
      collabDeadline: escrow.collabDeadline,
    });
  }

  // ─── Job-only helpers ─────────────────────────────────────────────────────

  async expirePendingPayment(
    escrow: EscrowDocument,
    session: ClientSession,
  ): Promise<{ bid: BidDocument | null; campaignTitle: string }> {
    const now = new Date();

    await this.escrowRepository.updateByIdWithSession(
      escrow._id.toString(),
      { status: EscrowStatus.Cancelled, cancelledAt: now },
      session,
    );

    const bid = await this.bidRepository.updateStatusWithSession(
      escrow.bidId.toString(),
      BidStatus.Declined,
      { declineReason: "payment_timeout", declinedAt: now, autoDeclined: true },
      session,
    );

    await this.campaignRepository.updateStatus(
      escrow.campaignId.toString(),
      CampaignStatus.Active,
      undefined,
      session,
    );

    const campaign = await this.campaignRepository.findById(escrow.campaignId.toString());

    return { bid, campaignTitle: campaign?.title ?? "your campaign" };
  }

  async publishPaymentTimeoutNotifications(escrow: EscrowDocument, campaignTitle: string): Promise<void> {
    await Promise.all([
      this.notificationRepository.createNotification({
        recipientId: escrow.brandId.toString(),
        recipientRole: UserRole.Brand,
        type: "escrow.cancelled",
        title: "Escrow cancelled",
        body: `Your escrow for ${campaignTitle} was cancelled due to payment timeout.`,
        meta: { escrowId: escrow._id.toString(), reason: "payment_timeout" },
      }),
      this.notificationRepository.createNotification({
        recipientId: escrow.creatorId.toString(),
        recipientRole: UserRole.Creator,
        type: "escrow.cancelled",
        title: "Bid no longer active",
        body: `The brand did not complete payment for ${campaignTitle}. Your bid is no longer active.`,
        meta: { escrowId: escrow._id.toString(), reason: "payment_timeout" },
      }),
    ]);

    this.eventPublisher.publish(
      "escrow.cancelled",
      {
        escrowId: escrow._id.toString(),
        bidId: escrow.bidId.toString(),
        campaignId: escrow.campaignId.toString(),
        brandId: escrow.brandId.toString(),
        reason: "payment_timeout",
      },
      ESCROW_EXCHANGE_NAME,
    );
  }

  async startSession(): Promise<ClientSession> {
    return this.escrowRepository.startSession();
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private calculateAmounts(proposedAmountRupees: number): {
    agreedAmount: number;
    platformFeeAmount: number;
    totalChargedAmount: number;
    creatorReceivableAmount: number;
  } {
    const agreedAmount = proposedAmountRupees * PAISE_PER_RUPEE;
    const platformFeeAmount = Math.round(agreedAmount * PLATFORM_FEE_RATIO);
    const totalChargedAmount = agreedAmount + platformFeeAmount;
    const creatorReceivableAmount = agreedAmount;
    return { agreedAmount, platformFeeAmount, totalChargedAmount, creatorReceivableAmount };
  }

  private async onPaymentCaptured(payload: WebhookPayload): Promise<void> {
    const paymentEntity = payload.payload.payment.entity;
    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;

    const escrow = await this.escrowRepository.findByRazorpayOrderId(orderId);
    if (!escrow) {
      logger.warn("EscrowService: webhook for unknown order_id", { orderId });
      return;
    }

    if (escrow.status === EscrowStatus.Funded) {
      logger.debug("EscrowService: payment.captured ignored, escrow already funded", {
        escrowId: escrow._id.toString(),
      });
      return;
    }

    const lockKey = this.webhookLockKey(escrow._id.toString());
    const lockToken = await this.lockService.acquire(lockKey, WEBHOOK_LOCK_TTL_SECONDS);
    if (!lockToken) {
      logger.warn("EscrowService: webhook lock not acquired, skipping", {
        escrowId: escrow._id.toString(),
      });
      return;
    }

    try {
      const verified = await this.razorpayService.fetchPayment(paymentId);
      if (verified.status !== "captured") {
        logger.warn("EscrowService: fetched payment is not captured", {
          paymentId,
          status: verified.status,
        });
        await this.escrowRepository.appendWebhookEvent(
          escrow._id.toString(),
          "payment.captured.unverified",
          payload as unknown as Record<string, unknown>,
        );
        return;
      }
      if (Number(verified.amount) !== escrow.totalChargedAmount) {
        logger.error("EscrowService: payment amount mismatch", {
          escrowId: escrow._id.toString(),
          expected: escrow.totalChargedAmount,
          received: verified.amount,
        });
        await this.escrowRepository.appendWebhookEvent(
          escrow._id.toString(),
          "payment.captured.amount_mismatch",
          payload as unknown as Record<string, unknown>,
        );
        throw new AuthError("Payment amount mismatch", "PAYMENT_AMOUNT_MISMATCH");
      }

      const fresh = await this.escrowRepository.findById(escrow._id.toString());
      if (!fresh || fresh.status === EscrowStatus.Funded) {
        return;
      }

      const now = new Date();
      await this.escrowRepository.updateById(escrow._id.toString(), {
        status: EscrowStatus.Funded,
        razorpayPaymentId: paymentId,
        razorpaySignature: null,
        fundedAt: now,
        paymentCapturedAt: now,
      });

      await this.escrowRepository.appendWebhookEvent(
        escrow._id.toString(),
        "payment.captured",
        payload as unknown as Record<string, unknown>,
      );

      this.eventPublisher.publish(
        "escrow.funded",
        {
          escrowId: escrow._id.toString(),
          bidId: escrow.bidId.toString(),
          campaignId: escrow.campaignId.toString(),
          brandId: escrow.brandId.toString(),
          creatorId: escrow.creatorId.toString(),
          agreedAmount: escrow.agreedAmount,
          collabDeadline: escrow.collabDeadline,
        },
        ESCROW_EXCHANGE_NAME,
      );
    } finally {
      await this.lockService.release(lockKey, lockToken);
    }
  }

  private async onPaymentFailed(payload: WebhookPayload): Promise<void> {
    const paymentEntity = payload.payload.payment.entity;
    const escrow = await this.escrowRepository.findByRazorpayOrderId(paymentEntity.order_id);
    if (!escrow) return;

    await this.escrowRepository.appendWebhookEvent(
      escrow._id.toString(),
      "payment.failed",
      payload as unknown as Record<string, unknown>,
    );

    const campaign = await this.campaignRepository.findById(escrow.campaignId.toString());
    const campaignTitle = campaign?.title ?? "your campaign";

    await this.notificationRepository.createNotification({
      recipientId: escrow.brandId.toString(),
      recipientRole: UserRole.Brand,
      type: "escrow.payment_failed",
      title: "Payment failed",
      body: `Your payment for ${campaignTitle} failed. Please retry before ${escrow.paymentDeadline.toLocaleString("en-IN")}.`,
      meta: {
        escrowId: escrow._id.toString(),
        razorpayOrderId: escrow.razorpayOrderId,
        paymentUrl: `${env.FRONTEND_PAYMENT_URL}/${escrow._id.toString()}`,
        paymentDeadline: escrow.paymentDeadline,
      },
    });
  }

  private webhookLockKey(escrowId: string): string {
    return `lock:webhook:escrow:${escrowId}`;
  }

  private toBrandView(escrow: EscrowDocument): EscrowBrandView {
    return {
      _id: escrow._id.toString(),
      bidId: escrow.bidId.toString(),
      campaignId: escrow.campaignId.toString(),
      brandId: escrow.brandId.toString(),
      creatorId: escrow.creatorId.toString(),
      agreedAmount: escrow.agreedAmount,
      platformFeeAmount: escrow.platformFeeAmount,
      totalChargedAmount: escrow.totalChargedAmount,
      creatorReceivableAmount: escrow.creatorReceivableAmount,
      razorpayOrderId: escrow.razorpayOrderId,
      razorpayPaymentId: escrow.razorpayPaymentId,
      razorpayRefundId: escrow.razorpayRefundId,
      status: escrow.status,
      paymentInitiatedAt: escrow.paymentInitiatedAt,
      paymentCapturedAt: escrow.paymentCapturedAt,
      fundedAt: escrow.fundedAt,
      releasedAt: escrow.releasedAt,
      refundedAt: escrow.refundedAt,
      cancelledAt: escrow.cancelledAt,
      paymentDeadline: escrow.paymentDeadline,
      collabDeadline: escrow.collabDeadline,
      createdAt: escrow.createdAt ?? new Date(),
      updatedAt: escrow.updatedAt ?? new Date(),
    };
  }

  private toCreatorView(escrow: EscrowDocument): EscrowCreatorView {
    return {
      _id: escrow._id.toString(),
      bidId: escrow.bidId.toString(),
      campaignId: escrow.campaignId.toString(),
      brandId: escrow.brandId.toString(),
      creatorId: escrow.creatorId.toString(),
      agreedAmount: escrow.agreedAmount,
      creatorReceivableAmount: escrow.creatorReceivableAmount,
      status: escrow.status,
      fundedAt: escrow.fundedAt,
      releasedAt: escrow.releasedAt,
      refundedAt: escrow.refundedAt,
      cancelledAt: escrow.cancelledAt,
      paymentDeadline: escrow.paymentDeadline,
      collabDeadline: escrow.collabDeadline,
      createdAt: escrow.createdAt ?? new Date(),
      updatedAt: escrow.updatedAt ?? new Date(),
    };
  }

  toCollabRoomView(room: CollabRoomDocument): CollabRoomView {
    return {
      _id: room._id.toString(),
      escrowId: room.escrowId.toString(),
      bidId: room.bidId.toString(),
      campaignId: room.campaignId.toString(),
      brandId: room.brandId.toString(),
      creatorId: room.creatorId.toString(),
      status: room.status,
      maxRevisions: room.maxRevisions,
      revisionCount: room.revisionCount,
      collabDeadline: room.collabDeadline,
      createdAt: room.createdAt ?? new Date(),
      updatedAt: room.updatedAt ?? new Date(),
    };
  }
}
