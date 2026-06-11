import { Types } from "mongoose";
import { NotificationModel, type INotification, type NotificationDocument } from "../../models/Notification.model";
import type { PaginatedResult, WriteData } from "../../core/types";
import type { INotificationRepository, CreateNotificationInput } from "../../core/interfaces/INotificationRepository";
import { BaseRepository } from "./BaseRepository";

export type { CreateNotificationInput };

export class NotificationRepository
  extends BaseRepository<NotificationDocument, INotification>
  implements INotificationRepository
{
  async findById(id: string): Promise<NotificationDocument | null> {
    return NotificationModel.findById(id).exec();
  }

  async create(data: WriteData<INotification>): Promise<NotificationDocument> {
    const [notification] = await NotificationModel.create([data]);
    if (!notification) throw new Error("Failed to create notification");
    return notification;
  }

  async updateById(
    id: string,
    data: WriteData<INotification>,
  ): Promise<NotificationDocument | null> {
    return NotificationModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await NotificationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

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

    return this.buildPaginatedResult(items, total, page, limit);
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
