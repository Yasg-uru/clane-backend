export const EscrowStatus = {
  AWAITING_PAYMENT: "awaiting_payment",
  FUNDED: "funded",
  RELEASED: "released",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
  DISPUTED: "disputed",
} as const;
export type EscrowStatus = (typeof EscrowStatus)[keyof typeof EscrowStatus];

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
  paymentInitiatedAt: string;
  paymentCapturedAt: string | null;
  fundedAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  cancelledAt: string | null;
  paymentDeadline: string;
  collabDeadline: string;
  createdAt: string;
  updatedAt: string;
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
  fundedAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  cancelledAt: string | null;
  paymentDeadline: string;
  collabDeadline: string;
  createdAt: string;
  updatedAt: string;
}

export type Escrow = EscrowBrandView | EscrowCreatorView;

export interface PaginatedEscrows {
  items: Escrow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RefreshLinkResult {
  razorpayOrderId: string;
  paymentLink: string;
}
