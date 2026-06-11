import type { EscrowDocument } from "../../models/Escrow.model";
import type { EscrowBrandView, EscrowCreatorView } from "./escrow.types";

export class EscrowMapper {
  static toBrandView(escrow: EscrowDocument): EscrowBrandView {
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

  static toCreatorView(escrow: EscrowDocument): EscrowCreatorView {
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
}
