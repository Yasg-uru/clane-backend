import { ApiResponse } from "../../core/responses/ApiResponse";
import { AsyncHandler } from "../../utils/asyncHandler";
import { requireParam, requireUser } from "../../utils/httpContext";
import type { NotificationService } from "./NotificationService";
import { getNotificationsSchema } from "./notification.validator";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  getNotifications = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const { page, limit } = getNotificationsSchema.parse(req.query);
    const result = await this.notificationService.getNotifications(user.userId, page, limit);
    res.status(200).json(new ApiResponse("Notifications retrieved", result));
  });

  getUnreadCount = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const count = await this.notificationService.getUnreadCount(user.userId);
    res.status(200).json(new ApiResponse("Unread count retrieved", { count }));
  });

  markAsRead = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    const notificationId = requireParam(req, "notificationId");
    await this.notificationService.markAsRead(notificationId, user.userId);
    res.status(200).json(new ApiResponse("Notification marked as read", {}));
  });

  markAllAsRead = AsyncHandler.wrap(async (req, res) => {
    const user = requireUser(req);
    await this.notificationService.markAllAsRead(user.userId);
    res.status(200).json(new ApiResponse("All notifications marked as read", {}));
  });
}
