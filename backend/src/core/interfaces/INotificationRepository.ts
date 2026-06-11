import type { INotification, NotificationDocument, NotificationType } from "../../models/Notification.model";
import type { PaginatedResult, UserRole } from "../types";
import type { IRepository } from "./IRepository";

export interface CreateNotificationInput {
  recipientId: string;
  recipientRole: UserRole;
  type: NotificationType;
  title: string;
  body: string;
  meta?: Record<string, unknown>;
}

export interface INotificationRepository extends IRepository<NotificationDocument, INotification> {
  createNotification(data: CreateNotificationInput): Promise<NotificationDocument>;
  findByRecipient(recipientId: string, page: number, limit: number): Promise<PaginatedResult<NotificationDocument>>;
  markAsRead(notificationId: string, recipientId: string): Promise<void>;
  markAllAsRead(recipientId: string): Promise<void>;
  countUnread(recipientId: string): Promise<number>;
}
