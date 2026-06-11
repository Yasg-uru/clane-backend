import type { EscrowStatus } from "../../models/Escrow.model";

export interface EscrowAmounts {
  agreedAmount: number;
  platformFeeAmount: number;
  totalChargedAmount: number;
  creatorReceivableAmount: number;
}

export interface EscrowBrandView {
  _id: string;
  bidId: string;
  campaignId: string;
  brandId: string;
  creatorId: string;
  agreedAmount: number;
  platformFeeAmount: number;
  totalChargedAmount: number;
  creatorReceivableAmount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpayRefundId: string | null;
  status: EscrowStatus;
  paymentInitiatedAt: Date;
  paymentCapturedAt: Date | null;
  fundedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
  cancelledAt: Date | null;
  paymentDeadline: Date;
  collabDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscrowCreatorView {
  _id: string;
  bidId: string;
  campaignId: string;
  brandId: string;
  creatorId: string;
  agreedAmount: number;
  creatorReceivableAmount: number;
  status: EscrowStatus;
  fundedAt: Date | null;
  releasedAt: Date | null;
  refundedAt: Date | null;
  cancelledAt: Date | null;
  paymentDeadline: Date;
  collabDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}
