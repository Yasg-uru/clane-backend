import type { NotificationDocument } from "../../models/Notification.model";
import type { PaginatedResult } from "../../core/types";
import type { INotificationRepository } from "../../core/interfaces/INotificationRepository";

export class NotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async getNotifications(
    recipientId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<NotificationDocument>> {
    return this.notificationRepository.findByRecipient(recipientId, page, limit);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationRepository.countUnread(recipientId);
  }

  async markAsRead(notificationId: string, recipientId: string): Promise<void> {
    await this.notificationRepository.markAsRead(notificationId, recipientId);
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(recipientId);
  }
}
