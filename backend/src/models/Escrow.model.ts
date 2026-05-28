import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export type EscrowStatus =
  | "awaiting_payment"
  | "funded"
  | "released"
  | "refunded"
  | "cancelled"
  | "disputed";

export interface WebhookEvent {
  event: string;
  receivedAt: Date;
  payload: Record<string, unknown>;
}

export interface IEscrow {
  bidId: Types.ObjectId;
  campaignId: Types.ObjectId;
  brandId: Types.ObjectId;
  creatorId: Types.ObjectId;

  agreedAmount: number;
  platformFeeAmount: number;
  totalChargedAmount: number;
  creatorReceivableAmount: number;

  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  razorpaySignature: string | null;
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

  webhookEvents: WebhookEvent[];

  createdAt?: Date;
  updatedAt?: Date;
}

export type EscrowDocument = HydratedDocument<IEscrow>;

const webhookEventSchema = new Schema<WebhookEvent>(
  {
    event: { type: String, required: true },
    receivedAt: { type: Date, required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false },
);

const escrowSchema = new Schema<IEscrow>(
  {
    bidId: { type: Schema.Types.ObjectId, ref: "Bid", required: true, unique: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "Creator", required: true, index: true },

    agreedAmount: { type: Number, required: true, min: 0 },
    platformFeeAmount: { type: Number, required: true, min: 0 },
    totalChargedAmount: { type: Number, required: true, min: 0 },
    creatorReceivableAmount: { type: Number, required: true, min: 0 },

    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null, select: false },
    razorpayRefundId: { type: String, default: null },

    status: {
      type: String,
      enum: ["awaiting_payment", "funded", "released", "refunded", "cancelled", "disputed"],
      default: "awaiting_payment",
      index: true,
    },

    paymentInitiatedAt: { type: Date, required: true },
    paymentCapturedAt: { type: Date, default: null },
    fundedAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    paymentDeadline: { type: Date, required: true },
    collabDeadline: { type: Date, required: true },

    webhookEvents: { type: [webhookEventSchema], default: [], select: false },
  },
  { timestamps: true },
);

escrowSchema.index({ status: 1, paymentDeadline: 1 });
escrowSchema.index({ status: 1, collabDeadline: 1 });

export const EscrowModel = model<IEscrow>("Escrow", escrowSchema);
