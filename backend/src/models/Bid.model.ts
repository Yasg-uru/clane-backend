import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export enum BidStatus {
  Submitted = "submitted",
  Shortlisted = "shortlisted",
  Accepted = "accepted",
  Declined = "declined",
  Withdrawn = "withdrawn",
}

export interface IBid {
  campaignId: Types.ObjectId;
  creatorId: Types.ObjectId;
  brandId: Types.ObjectId;
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
  createdAt?: Date;
  updatedAt?: Date;
}

export type BidDocument = HydratedDocument<IBid>;

const bidSchema = new Schema<IBid>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "Creator", required: true, index: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    proposedAmount: { type: Number, required: true, min: 1, max: 10_000_000 },
    pitch: { type: String, required: true, minlength: 100, maxlength: 1000 },
    attachmentUrl: { type: String, default: null, maxlength: 500 },
    proposedTimeline: { type: Number, required: true, min: 3, max: 60 },
    status: {
      type: String,
      enum: Object.values(BidStatus),
      default: BidStatus.Submitted,
      index: true,
    },
    declineReason: { type: String, default: null, maxlength: 500 },
    withdrawReason: { type: String, default: null, maxlength: 500 },
    autoDeclined: { type: Boolean, default: false },
    shortlistedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    declinedAt: { type: Date, default: null },
    withdrawnAt: { type: Date, default: null },
    campaignBudgetAtBid: { type: Number, required: true },
    campaignDeadlineAtBid: { type: Date, required: true },
    campaignTitleAtBid: { type: String, required: true },
  },
  { timestamps: true },
);

bidSchema.index({ campaignId: 1, status: 1 });
bidSchema.index({ creatorId: 1, status: 1 });
bidSchema.index({ brandId: 1, createdAt: -1 });
bidSchema.index({ campaignId: 1, creatorId: 1 }, { unique: true });
bidSchema.index({ campaignId: 1, status: 1, proposedAmount: 1 });

export const BidModel = model<IBid>("Bid", bidSchema);
