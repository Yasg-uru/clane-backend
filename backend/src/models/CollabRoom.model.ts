import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export enum CollabRoomStatus {
  PendingChat = "pending_chat",
  Active = "active",
  ContentSubmitted = "content_submitted",
  UnderReview = "under_review",
  RevisionRequested = "revision_requested",
  Approved = "approved",
  Completed = "completed",
  Disputed = "disputed",
}

export interface ICollabRoom {
  escrowId: Types.ObjectId;
  bidId: Types.ObjectId;
  campaignId: Types.ObjectId;
  brandId: Types.ObjectId;
  creatorId: Types.ObjectId;

  status: CollabRoomStatus;

  maxRevisions: number;
  revisionCount: number;

  collabDeadline: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export type CollabRoomDocument = HydratedDocument<ICollabRoom>;

const collabRoomSchema = new Schema<ICollabRoom>(
  {
    escrowId: { type: Schema.Types.ObjectId, ref: "Escrow", required: true, unique: true },
    bidId: { type: Schema.Types.ObjectId, ref: "Bid", required: true, unique: true },
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    brandId: { type: Schema.Types.ObjectId, ref: "Brand", required: true, index: true },
    creatorId: { type: Schema.Types.ObjectId, ref: "Creator", required: true, index: true },

    status: {
      type: String,
      enum: Object.values(CollabRoomStatus),
      default: CollabRoomStatus.PendingChat,
      index: true,
    },

    maxRevisions: { type: Number, required: true, min: 1, max: 2 },
    revisionCount: { type: Number, default: 0, min: 0 },

    collabDeadline: { type: Date, required: true },
  },
  { timestamps: true },
);

collabRoomSchema.index({ brandId: 1, status: 1 });

export const CollabRoomModel = model<ICollabRoom>("CollabRoom", collabRoomSchema);
