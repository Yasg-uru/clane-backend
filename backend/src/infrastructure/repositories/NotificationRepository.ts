import { Types } from "mongoose";
import { NotificationModel, type NotificationDocument } from "../../models/Notification.model";
import type { PaginatedResult } from "../../core/types";
import type { UserRole } from "../../core/types";

export interface CreateNotificationInput {
  recipientId: string;
  recipientRole: UserRole;
  type: string;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
}

export class NotificationRepository {
  async createNotification(data: CreateNotificationInput): Promise<NotificationDocument> {
    const [notification] = await NotificationModel.create([
      {
        recipientId: new Types.ObjectId(data.recipientId),
        recipientRole: data.recipientRole,
        type: data.type,
        title: data.title,
        body: data.body,
        meta: data.meta ?? {},
        isRead: false,
        readAt: null,
      },
    ]);
    if (!notification) throw new Error("Failed to create notification");
    return notification;
  }

  async findByRecipient(
    recipientId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<NotificationDocument>> {
    const query = { recipientId: new Types.ObjectId(recipientId) };

    const [total, items] = await Promise.all([
      NotificationModel.countDocuments(query),
      NotificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId, recipientId: new Types.ObjectId(recipientId) },
      { isRead: true, readAt: new Date() },
    ).exec();
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipientId: new Types.ObjectId(recipientId), isRead: false },
      { isRead: true, readAt: new Date() },
    ).exec();
  }

  async countUnread(recipientId: string): Promise<number> {
    return NotificationModel.countDocuments({
      recipientId: new Types.ObjectId(recipientId),
      isRead: false,
    });
  }
}
