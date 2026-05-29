import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { UserRole } from "../core/types";

export enum NotificationType {
  BidSubmitted = "bid.submitted",
  BidShortlisted = "bid.shortlisted",
  BidDeclined = "bid.declined",
  BidWithdrawn = "bid.withdrawn",
  BidAccepted = "bid.accepted",
  EscrowPaymentRequired = "escrow.payment_required",
  EscrowPaymentFailed = "escrow.payment_failed",
  EscrowFunded = "escrow.funded",
  EscrowCancelled = "escrow.cancelled",
  CollabRoomReady = "collab.room_ready",
}

export interface INotification {
  recipientId: Types.ObjectId;
  recipientRole: UserRole;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  readAt: Date | null;
  meta: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true, index: true },
    recipientRole: { type: String, enum: Object.values(UserRole), required: true },
    type: { type: String, enum: Object.values(NotificationType), required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

export const NotificationModel = model<INotification>("Notification", notificationSchema);
